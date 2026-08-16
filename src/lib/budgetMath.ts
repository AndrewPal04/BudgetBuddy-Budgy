import type { ExpenseRow, IncomeRow } from '../types/database'

const BIWEEKLY_PAYCHECKS_PER_MONTH = 26 / 12

/** Normalizes a single income entry to a monthly figure regardless of pay frequency. */
export function normalizeIncomeToMonthly(entry: IncomeRow): number {
  return entry.frequency === 'monthly' ? entry.amount : entry.amount * BIWEEKLY_PAYCHECKS_PER_MONTH
}

/** Normalizes every income entry to a monthly figure so mixed pay frequencies are comparable. */
export function monthlyIncomeTotal(entries: IncomeRow[]): number {
  return entries.reduce((sum, entry) => sum + normalizeIncomeToMonthly(entry), 0)
}

/**
 * Normalizes a single expense to a monthly figure: recurring subscriptions become a
 * monthly cost, one-time expenses count in full (they're a single incurred cost, not recurring).
 */
export function normalizeExpenseToMonthly(entry: ExpenseRow): number {
  if (entry.type === 'subscription') {
    return entry.billing_cycle === 'yearly' ? entry.amount / 12 : entry.amount
  }
  return entry.amount
}

/** "Amount spent": every expense normalized to a monthly figure and summed. */
export function monthlyExpenseTotal(entries: ExpenseRow[]): number {
  return entries.reduce((sum, entry) => sum + normalizeExpenseToMonthly(entry), 0)
}

/** Monthly spend within a single category, for checking against a budget limit. */
export function monthlyCategorySpend(entries: ExpenseRow[], category: ExpenseRow['category']): number {
  return entries
    .filter((entry) => entry.category === category)
    .reduce((sum, entry) => sum + normalizeExpenseToMonthly(entry), 0)
}
