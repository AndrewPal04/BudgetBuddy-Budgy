-- One-time backfill: existing subscriptions predate the billing_date column, so
-- they have none. Use the date each was originally logged (created_at) as a
-- reasonable default anchor — the actual real-world billing date may differ and
-- can be corrected per-subscription via Edit in the app.

update expenses
set billing_date = created_at::date
where type = 'subscription' and billing_date is null;
