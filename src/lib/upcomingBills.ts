import type { BillingCycle, ExpenseRow } from '../types/database'

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** Parses a 'YYYY-MM-DD' string into local date parts, avoiding the UTC-parsing
 * timezone shift that `new Date(string)` has for date-only strings. */
function parseDateOnly(value: string): { year: number; month: number; day: number } {
  const [year, month, day] = value.split('-').map(Number)
  return { year, month: month - 1, day }
}

function dateFor(year: number, month: number, day: number): Date {
  // Clamp to the target month's last day (e.g. anchor day 31 in a 30-day month).
  const clampedDay = Math.min(day, daysInMonth(year, month))
  return new Date(year, month, clampedDay)
}

/**
 * Projects the next occurrence of a recurring bill from an anchor `billingDate`
 * (day-of-month for monthly, month+day for yearly), rolled forward to today or later.
 */
export function nextRenewalDate(
  billingDate: string,
  cycle: BillingCycle,
  from: Date = new Date(),
): Date {
  const anchor = parseDateOnly(billingDate)
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())

  if (cycle === 'monthly') {
    let candidate = dateFor(today.getFullYear(), today.getMonth(), anchor.day)
    if (candidate < today) {
      const nextMonthIndex = today.getMonth() + 1
      candidate = dateFor(
        today.getFullYear() + Math.floor(nextMonthIndex / 12),
        nextMonthIndex % 12,
        anchor.day,
      )
    }
    return candidate
  }

  let candidate = dateFor(today.getFullYear(), anchor.month, anchor.day)
  if (candidate < today) {
    candidate = dateFor(today.getFullYear() + 1, anchor.month, anchor.day)
  }
  return candidate
}

export interface UpcomingBill {
  expense: ExpenseRow
  nextDate: Date
  daysUntil: number
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

/** Subscriptions with a billing date set, sorted by soonest renewal first. */
export function buildUpcomingBills(expenses: ExpenseRow[], from: Date = new Date()): UpcomingBill[] {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())

  return expenses
    .filter(
      (expense): expense is ExpenseRow & { billing_cycle: BillingCycle; billing_date: string } =>
        expense.type === 'subscription' && Boolean(expense.billing_cycle && expense.billing_date),
    )
    .map((expense) => {
      const nextDate = nextRenewalDate(expense.billing_date, expense.billing_cycle, from)
      const daysUntil = Math.round((nextDate.getTime() - today.getTime()) / MS_PER_DAY)
      return { expense, nextDate, daysUntil }
    })
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())
}
