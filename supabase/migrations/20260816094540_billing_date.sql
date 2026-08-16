-- Upcoming bills: an anchor billing date for subscriptions, used to project the
-- next renewal (day-of-month for monthly, month+day for yearly). Nullable —
-- only meaningful for subscription-type expenses, and existing rows have none yet.

alter table expenses
  add column billing_date date;
