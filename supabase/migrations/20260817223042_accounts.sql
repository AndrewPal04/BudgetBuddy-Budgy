-- Bank accounts: users can add multiple Checking/Savings accounts with their
-- own names and track how much is currently in each.

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null check (type in ('checking', 'savings')),
  balance numeric(12, 2) not null default 0 check (balance >= 0),
  created_at timestamptz not null default now()
);

create index if not exists accounts_user_id_idx on accounts (user_id);

alter table accounts enable row level security;

create policy "Individuals can view own accounts" on accounts
  for select using (auth.uid() = user_id);
create policy "Individuals can insert own accounts" on accounts
  for insert with check (auth.uid() = user_id);
create policy "Individuals can update own accounts" on accounts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Individuals can delete own accounts" on accounts
  for delete using (auth.uid() = user_id);
