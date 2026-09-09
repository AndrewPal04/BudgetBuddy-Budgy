import type { AccountRow, ExpenseRow } from '../types/database'
import type { IncomeEntry } from '../hooks/useIncome'
import { monthlyCategorySpend, monthlyExpenseTotal, normalizeExpenseToMonthly } from './budgetMath'
import { buildAccountGrowth } from './accountGrowth'
import { CATEGORY_LABELS, CATEGORY_VALUES } from './expenseCategories'

export interface FunFact {
  id: string
  text: string
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const currencyFormatterWhole = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function topCategoryFact(expenses: ExpenseRow[]): FunFact | null {
  const total = monthlyExpenseTotal(expenses)
  if (total <= 0) return null

  let topCategory: ExpenseRow['category'] | null = null
  let topSpend = 0
  for (const category of CATEGORY_VALUES) {
    const spend = monthlyCategorySpend(expenses, category)
    if (spend > topSpend) {
      topSpend = spend
      topCategory = category
    }
  }
  if (!topCategory) return null

  const percent = Math.round((topSpend / total) * 100)
  return {
    id: 'top-category',
    text: `${CATEGORY_LABELS[topCategory]} is your top spending category this month at ${percent}% of spending (${currencyFormatter.format(topSpend)}).`,
  }
}

function subscriptionTotalFact(expenses: ExpenseRow[]): FunFact | null {
  const subscriptions = expenses.filter((expense) => expense.type === 'subscription')
  if (subscriptions.length === 0) return null

  const monthly = subscriptions.reduce((sum, expense) => sum + normalizeExpenseToMonthly(expense), 0)
  const label = subscriptions.length === 1 ? 'subscription' : 'subscriptions'
  return {
    id: 'subscription-total',
    text: `You have ${subscriptions.length} ${label} costing ${currencyFormatter.format(monthly)}/mo — that's ${currencyFormatter.format(monthly * 12)}/yr.`,
  }
}

function accountGrowthFact(
  accounts: AccountRow[],
  income: IncomeEntry[],
  expenses: ExpenseRow[],
): FunFact | null {
  if (accounts.length === 0) return null
  const total = buildAccountGrowth(accounts, income, expenses).reduce(
    (sum, account) => sum + account.increase,
    0,
  )
  if (total === 0) return null

  const verb = total > 0 ? 'up' : 'down'
  return {
    id: 'account-growth',
    text: `Your accounts are ${verb} ${currencyFormatter.format(Math.abs(total))} total since you started tracking them.`,
  }
}

function interestProjectionFact(accounts: AccountRow[]): FunFact | null {
  const earningAccounts = accounts.filter(
    (account) => account.type === 'savings' && (account.interest_rate ?? 0) > 0,
  )
  if (earningAccounts.length === 0) return null

  const projected = earningAccounts.reduce(
    (sum, account) => sum + account.balance * ((account.interest_rate ?? 0) / 100),
    0,
  )
  if (projected <= 0) return null

  return {
    id: 'interest-projection',
    text: `Your savings accounts are on track to earn about ${currencyFormatterWhole.format(projected)} in interest this year.`,
  }
}

function activityStreakFact(income: IncomeEntry[], expenses: ExpenseRow[]): FunFact | null {
  if (income.length === 0 && expenses.length === 0) return null

  const expenseLabel = expenses.length === 1 ? 'expense' : 'expenses'
  const incomeLabel = income.length === 1 ? 'entry' : 'entries'
  return {
    id: 'activity-streak',
    text: `You've logged ${expenses.length} ${expenseLabel} and ${income.length} income ${incomeLabel} so far.`,
  }
}

/**
 * A short list of "did you know" style facts derived from the user's tracked data. Each
 * fact quietly omits itself when there isn't enough data yet to say something true.
 */
export function buildFunFacts(
  accounts: AccountRow[],
  income: IncomeEntry[],
  expenses: ExpenseRow[],
): FunFact[] {
  return [
    topCategoryFact(expenses),
    subscriptionTotalFact(expenses),
    accountGrowthFact(accounts, income, expenses),
    interestProjectionFact(accounts),
    activityStreakFact(income, expenses),
  ].filter((fact): fact is FunFact => fact !== null)
}
