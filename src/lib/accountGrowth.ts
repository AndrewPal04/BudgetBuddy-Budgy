import type { AccountRow, ExpenseRow } from '../types/database'
import type { IncomeEntry } from '../hooks/useIncome'

export interface AccountGrowth {
  accountId: string
  name: string
  createdAt: string
  increase: number
}

/**
 * Net change in an account's balance since it was created: total income allocated to it,
 * minus total expenses paid from it. This is exact as long as the balance has only ever
 * changed through logged income/expenses — nothing here can detect a manual edit to an
 * account's balance after creation, which would throw the number off.
 */
export function buildAccountGrowth(
  accounts: AccountRow[],
  income: IncomeEntry[],
  expenses: ExpenseRow[],
): AccountGrowth[] {
  return accounts.map((account) => {
    const incomeTotal = income.reduce((sum, entry) => {
      const allocation = entry.allocations.find((item) => item.account_id === account.id)
      return sum + (allocation?.amount ?? 0)
    }, 0)
    const expenseTotal = expenses.reduce(
      (sum, entry) => sum + (entry.account_id === account.id ? entry.amount : 0),
      0,
    )

    return {
      accountId: account.id,
      name: account.name,
      createdAt: account.created_at,
      increase: incomeTotal - expenseTotal,
    }
  })
}
