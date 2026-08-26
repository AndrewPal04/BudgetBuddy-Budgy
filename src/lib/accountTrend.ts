import type { AccountRow, ExpenseRow } from '../types/database'
import type { IncomeEntry } from '../hooks/useIncome'
import { normalizeExpenseToMonthly, normalizeIncomeToMonthly } from './budgetMath'

export interface AccountTrendSeries {
  key: string
  name: string
}

export interface AccountTrendPoint {
  label: string
  [accountId: string]: number | string
}

/** An account's monthly net rate: income allocated to it, minus expenses paid from it,
 * both normalized to a monthly figure regardless of pay frequency/billing cycle. */
function accountMonthlyRate(account: AccountRow, income: IncomeEntry[], expenses: ExpenseRow[]): number {
  let rate = 0
  for (const entry of income) {
    const allocation = entry.allocations.find((item) => item.account_id === account.id)
    if (!allocation || entry.amount <= 0) continue
    rate += normalizeIncomeToMonthly(entry) * (allocation.amount / entry.amount)
  }
  for (const entry of expenses) {
    if (entry.account_id === account.id) rate -= normalizeExpenseToMonthly(entry)
  }
  return rate
}

/**
 * Projects every account's balance across the current calendar year (Jan–Dec), one line
 * per account. Anchored so the current month equals the account's live balance; other
 * months extrapolate from it using the account's own monthly net rate — the same
 * constant-rate approach the old aggregate projection used, just scoped per account and
 * fixed to the calendar year instead of rolling forward from today.
 */
export function buildAccountYearlyTrend(
  accounts: AccountRow[],
  income: IncomeEntry[],
  expenses: ExpenseRow[],
): { data: AccountTrendPoint[]; series: AccountTrendSeries[] } {
  const now = new Date()
  const year = now.getFullYear()
  const currentMonthIndex = now.getMonth()

  const series = accounts.map((account) => ({ key: account.id, name: account.name }))
  const rates = new Map(
    accounts.map((account) => [account.id, accountMonthlyRate(account, income, expenses)]),
  )

  const data: AccountTrendPoint[] = []
  for (let month = 0; month < 12; month++) {
    const point: AccountTrendPoint = {
      label: new Date(year, month, 1).toLocaleDateString('en-US', { month: 'short' }),
    }
    for (const account of accounts) {
      const rate = rates.get(account.id) ?? 0
      point[account.id] = account.balance + rate * (month - currentMonthIndex)
    }
    data.push(point)
  }

  return { data, series }
}
