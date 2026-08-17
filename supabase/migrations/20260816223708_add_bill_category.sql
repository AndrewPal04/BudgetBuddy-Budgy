-- Add 'bill' as an allowed expense/budget-limit category. The existing
-- 'subscriptions' value is kept as-is (only its display label changes app-side,
-- from "Subscriptions" to "Subscription") — no data migration needed for that part.
--
-- Constraint names are looked up dynamically rather than assumed, since
-- budget_limits' category check was declared inline (Postgres auto-names those).

do $$
declare
  expenses_constraint text;
  budget_limits_constraint text;
begin
  select conname into expenses_constraint
  from pg_constraint
  where conrelid = 'expenses'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%category%';

  if expenses_constraint is not null then
    execute format('alter table expenses drop constraint %I', expenses_constraint);
  end if;

  select conname into budget_limits_constraint
  from pg_constraint
  where conrelid = 'budget_limits'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%category%';

  if budget_limits_constraint is not null then
    execute format('alter table budget_limits drop constraint %I', budget_limits_constraint);
  end if;
end $$;

alter table expenses
  add constraint expenses_category_check check (
    category in (
      'housing', 'groceries', 'transportation', 'utilities', 'bill', 'subscriptions',
      'entertainment', 'dining_out', 'health', 'shopping', 'other'
    )
  );

alter table budget_limits
  add constraint budget_limits_category_check check (
    category in (
      'housing', 'groceries', 'transportation', 'utilities', 'bill', 'subscriptions',
      'entertainment', 'dining_out', 'health', 'shopping', 'other'
    )
  );
