import type { SavingsGoalRow } from '../types/database'

const AVG_DAYS_PER_MONTH = 30.44
const PROJECTION_MONTHS = 12

export interface SavingsProjectionPoint {
  label: string
  amount: number
  [key: string]: number | string
}

/**
 * Projects savings forward from a baseline (the latest recorded snapshot, or 0 if none
 * exist yet) using the current monthly savings rate (income minus expenses). There's no
 * per-transaction history in this schema, so this is a forward trend line, not a lookback.
 */
export function buildSavingsProjection(
  baseline: number,
  monthlyRate: number,
  months: number = PROJECTION_MONTHS,
): SavingsProjectionPoint[] {
  const now = new Date()
  const points: SavingsProjectionPoint[] = []

  for (let i = 0; i <= months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
    points.push({
      label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      amount: baseline + monthlyRate * i,
    })
  }

  return points
}

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
