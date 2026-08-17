import type { ExpenseCategory } from '../types/database'

export const CATEGORY_VALUES = [
  'housing',
  'groceries',
  'transportation',
  'utilities',
  'bill',
  'subscriptions',
  'entertainment',
  'dining_out',
  'health',
  'shopping',
  'other',
] as const satisfies readonly ExpenseCategory[]

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  housing: 'Housing',
  groceries: 'Groceries',
  transportation: 'Transportation',
  utilities: 'Utilities',
  bill: 'Bill',
  subscriptions: 'Subscription',
  entertainment: 'Entertainment',
  dining_out: 'Dining Out',
  health: 'Health',
  shopping: 'Shopping',
  other: 'Other',
}
