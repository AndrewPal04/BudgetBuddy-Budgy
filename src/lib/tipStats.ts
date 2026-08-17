import type { ExpenseRow, IncomeRow } from '../types/database'
import { monthlyExpenseTotal, monthlyIncomeTotal } from './budgetMath'

export interface PercentStat {
  label: string
  value: string
}

function percentOf(part: number, whole: number): number {
  if (whole <= 0) return 0
  return (part / whole) * 100
}

function monthlySubscriptionTotal(expenses: ExpenseRow[]): number {
  return expenses.reduce((sum, entry) => {
    if (entry.type !== 'subscription') return sum
    return sum + (entry.billing_cycle === 'yearly' ? entry.amount / 12 : entry.amount)
  }, 0)
}

/** Simple, non-AI budget stats — always shown, and the fallback if the AI call fails. */
export function buildPercentStats(income: IncomeRow[], expenses: ExpenseRow[]): PercentStat[] {
  const monthlyIncome = monthlyIncomeTotal(income)
  const monthlyExpenses = monthlyExpenseTotal(expenses)
  const subscriptionMonthly = monthlySubscriptionTotal(expenses)
  const stats: PercentStat[] = []

  if (monthlyIncome <= 0) return stats

  stats.push({
    label: 'Spending vs. income',
    value: `You're spending ${percentOf(monthlyExpenses, monthlyIncome).toFixed(0)}% of your monthly income.`,
  })

  const savingsRate = percentOf(monthlyIncome - monthlyExpenses, monthlyIncome)
  stats.push({
    label: 'Savings rate',
    value:
      savingsRate >= 0
        ? `You're saving ${savingsRate.toFixed(0)}% of your income each month.`
        : `You're spending ${Math.abs(savingsRate).toFixed(0)}% more than you earn each month.`,
  })

  if (subscriptionMonthly > 0) {
    stats.push({
      label: 'Recurring expenses',
      value: `Recurring expenses make up ${percentOf(subscriptionMonthly, monthlyIncome).toFixed(0)}% of your monthly income.`,
    })
  }

  return stats
}
