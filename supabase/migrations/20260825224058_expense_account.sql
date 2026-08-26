-- Expenses can optionally be paid from a specific account. Paying from an
-- account debits its balance automatically, mirroring how income allocations
-- credit accounts. Account balances may now go negative (overdraft-style)
-- since an expense shouldn't be blocked just because the tracked balance is
-- thin.

alter table accounts drop constraint if exists accounts_balance_check;

alter table expenses
  add column account_id uuid references accounts (id) on delete set null;

create index if not exists expenses_account_id_idx on expenses (account_id);

create or replace function apply_expense_account_balance()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    if new.account_id is not null then
      update accounts set balance = balance - new.amount where id = new.account_id;
    end if;
    return new;
  elsif (tg_op = 'UPDATE') then
    if old.account_id is distinct from new.account_id then
      if old.account_id is not null then
        update accounts set balance = balance + old.amount where id = old.account_id;
      end if;
      if new.account_id is not null then
        update accounts set balance = balance - new.amount where id = new.account_id;
      end if;
    elsif new.account_id is not null and old.amount <> new.amount then
      update accounts set balance = balance - (new.amount - old.amount) where id = new.account_id;
    end if;
    return new;
  elsif (tg_op = 'DELETE') then
    if old.account_id is not null then
      update accounts set balance = balance + old.amount where id = old.account_id;
    end if;
    return old;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger expenses_account_balance_trigger
  after insert or update or delete on expenses
  for each row execute function apply_expense_account_balance();
