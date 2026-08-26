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

/** Nominal APR compounded monthly. No rate set means 0% growth. */
function accountMonthlyInterestRate(account: AccountRow): number {
  return (account.interest_rate ?? 0) / 100 / 12
}

/**
 * Projects every account's balance across the current calendar year (Jan–Dec), one line
 * per account. Anchored so the current month equals the account's live balance.
 *
 * Months after today compound forward: each month's balance is the prior month's balance
 * grown by the account's interest rate, plus its monthly net cash flow (income allocated
 * to it minus expenses paid from it). Months before today are extrapolated backward using
 * cash flow alone — interest isn't backdated, since we don't know what actually compounded
 * in the past.
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

  const valuesByAccount = new Map<string, number[]>()
  for (const account of accounts) {
    const rate = accountMonthlyRate(account, income, expenses)
    const monthlyInterest = accountMonthlyInterestRate(account)
    const values = new Array<number>(12)
    values[currentMonthIndex] = account.balance

    for (let month = currentMonthIndex - 1; month >= 0; month--) {
      values[month] = values[month + 1] - rate
    }
    for (let month = currentMonthIndex + 1; month < 12; month++) {
      values[month] = values[month - 1] * (1 + monthlyInterest) + rate
    }

    valuesByAccount.set(account.id, values)
  }

  const data: AccountTrendPoint[] = []
  for (let month = 0; month < 12; month++) {
    const point: AccountTrendPoint = {
      label: new Date(year, month, 1).toLocaleDateString('en-US', { month: 'short' }),
    }
    for (const account of accounts) {
      point[account.id] = valuesByAccount.get(account.id)?.[month] ?? account.balance
    }
    data.push(point)
  }

  return { data, series }
}
