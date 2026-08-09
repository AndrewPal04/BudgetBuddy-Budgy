-- Budgy the Budget Buddy — initial schema
-- Run this in the Supabase Dashboard: Project > SQL Editor > New query

create table if not exists income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_name text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  frequency text not null check (frequency in ('monthly', 'biweekly')),
  created_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  type text not null check (type in ('one_time', 'subscription')),
  billing_cycle text check (billing_cycle in ('monthly', 'yearly')),
  created_at timestamptz not null default now()
);

create table if not exists savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_amount numeric(12, 2) not null check (target_amount >= 0),
  current_amount numeric(12, 2) not null default 0 check (current_amount >= 0),
  target_date date,
  created_at timestamptz not null default now()
);

create table if not exists savings_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(12, 2) not null,
  recorded_at timestamptz not null default now()
);

create index if not exists income_user_id_idx on income (user_id);
create index if not exists expenses_user_id_idx on expenses (user_id);
create index if not exists savings_goals_user_id_idx on savings_goals (user_id);
create index if not exists savings_snapshots_user_id_idx on savings_snapshots (user_id);

alter table income enable row level security;
alter table expenses enable row level security;
alter table savings_goals enable row level security;
alter table savings_snapshots enable row level security;

create policy "Individuals can view own income" on income
  for select using (auth.uid() = user_id);
create policy "Individuals can insert own income" on income
  for insert with check (auth.uid() = user_id);
create policy "Individuals can update own income" on income
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Individuals can delete own income" on income
  for delete using (auth.uid() = user_id);

create policy "Individuals can view own expenses" on expenses
  for select using (auth.uid() = user_id);
create policy "Individuals can insert own expenses" on expenses
  for insert with check (auth.uid() = user_id);
create policy "Individuals can update own expenses" on expenses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Individuals can delete own expenses" on expenses
  for delete using (auth.uid() = user_id);

create policy "Individuals can view own savings goals" on savings_goals
  for select using (auth.uid() = user_id);
create policy "Individuals can insert own savings goals" on savings_goals
  for insert with check (auth.uid() = user_id);
create policy "Individuals can update own savings goals" on savings_goals
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Individuals can delete own savings goals" on savings_goals
  for delete using (auth.uid() = user_id);

create policy "Individuals can view own savings snapshots" on savings_snapshots
  for select using (auth.uid() = user_id);
create policy "Individuals can insert own savings snapshots" on savings_snapshots
  for insert with check (auth.uid() = user_id);
create policy "Individuals can update own savings snapshots" on savings_snapshots
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Individuals can delete own savings snapshots" on savings_snapshots
  for delete using (auth.uid() = user_id);
