-- Category budget limits: expenses get a fixed category, and users can cap
-- monthly spend per category.

alter table expenses
  add column category text not null default 'other';

alter table expenses
  add constraint expenses_category_check check (
    category in (
      'housing', 'groceries', 'transportation', 'utilities', 'subscriptions',
      'entertainment', 'dining_out', 'health', 'shopping', 'other'
    )
  );

create table if not exists budget_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null check (
    category in (
      'housing', 'groceries', 'transportation', 'utilities', 'subscriptions',
      'entertainment', 'dining_out', 'health', 'shopping', 'other'
    )
  ),
  monthly_limit numeric(12, 2) not null check (monthly_limit >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, category)
);

create index if not exists budget_limits_user_id_idx on budget_limits (user_id);

alter table budget_limits enable row level security;

create policy "Individuals can view own budget limits" on budget_limits
  for select using (auth.uid() = user_id);
create policy "Individuals can insert own budget limits" on budget_limits
  for insert with check (auth.uid() = user_id);
create policy "Individuals can update own budget limits" on budget_limits
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Individuals can delete own budget limits" on budget_limits
  for delete using (auth.uid() = user_id);
