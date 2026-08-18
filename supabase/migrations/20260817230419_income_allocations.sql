-- Income allocations: each income entry can be split across one or more
-- accounts. Allocation amounts must sum to the income amount (enforced
-- client-side). Account balances stay in sync automatically via trigger.

create table if not exists income_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  income_id uuid not null references income (id) on delete cascade,
  account_id uuid not null references accounts (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index if not exists income_allocations_user_id_idx on income_allocations (user_id);
create index if not exists income_allocations_income_id_idx on income_allocations (income_id);
create index if not exists income_allocations_account_id_idx on income_allocations (account_id);

alter table income_allocations enable row level security;

create policy "Individuals can view own income allocations" on income_allocations
  for select using (auth.uid() = user_id);
create policy "Individuals can insert own income allocations" on income_allocations
  for insert with check (auth.uid() = user_id);
create policy "Individuals can update own income allocations" on income_allocations
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Individuals can delete own income allocations" on income_allocations
  for delete using (auth.uid() = user_id);

-- Keep account balances in sync with whatever is allocated to them.
create or replace function apply_income_allocation_balance()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update accounts set balance = balance + new.amount where id = new.account_id;
    return new;
  elsif (tg_op = 'UPDATE') then
    if new.account_id <> old.account_id then
      update accounts set balance = balance - old.amount where id = old.account_id;
      update accounts set balance = balance + new.amount where id = new.account_id;
    elsif new.amount <> old.amount then
      update accounts set balance = balance + (new.amount - old.amount) where id = new.account_id;
    end if;
    return new;
  elsif (tg_op = 'DELETE') then
    update accounts set balance = balance - old.amount where id = old.account_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger income_allocations_balance_trigger
  after insert or update or delete on income_allocations
  for each row execute function apply_income_allocation_balance();
