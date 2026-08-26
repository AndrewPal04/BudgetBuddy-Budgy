-- Optional annual interest rate (APR %) on an account, used to project growth
-- from compounding on top of tracked income/expenses. Null means 0% (no
-- growth assumed).

alter table accounts
  add column interest_rate numeric(6, 3) check (interest_rate >= 0);
