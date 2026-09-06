import type { SavingsGoalRow } from '../types/database'

const AVG_DAYS_PER_MONTH = 30.44

/** Fractional months between now and a target date (negative if the date has passed). */
export function monthsUntil(targetDateISO: string): number {
  const target = new Date(targetDateISO)
  const now = new Date()
  const days = (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return days / AVG_DAYS_PER_MONTH
}

/**
 * Whether a goal is on track to be met by its target date at the current monthly savings
 * rate. A goal with no target date, or one already reached, is always considered on track.
 */
export function isGoalReachable(goal: SavingsGoalRow, monthlyRate: number): boolean {
  const remaining = goal.target_amount - goal.current_amount
  if (remaining <= 0) return true
  if (!goal.target_date) return true

  const months = monthsUntil(goal.target_date)
  if (months <= 0) return false

  const requiredMonthlyRate = remaining / months
  return monthlyRate >= requiredMonthlyRate
}
