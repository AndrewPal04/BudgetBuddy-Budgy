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
 * "Amount spent": recurring subscriptions normalized to a monthly cost, plus
 * one-time expenses counted in full (they're a single incurred cost, not recurring).
 */
export function monthlyExpenseTotal(entries: ExpenseRow[]): number {
  return entries.reduce((sum, entry) => {
    if (entry.type === 'subscription') {
      const monthly = entry.billing_cycle === 'yearly' ? entry.amount / 12 : entry.amount
      return sum + monthly
    }
    return sum + entry.amount
  }, 0)
}
