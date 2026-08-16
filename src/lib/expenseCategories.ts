import type { ExpenseCategory } from '../types/database'

export const CATEGORY_VALUES = [
  'housing',
  'groceries',
  'transportation',
  'utilities',
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
  subscriptions: 'Subscriptions',
  entertainment: 'Entertainment',
  dining_out: 'Dining Out',
  health: 'Health',
  shopping: 'Shopping',
  other: 'Other',
}
