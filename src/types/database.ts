export type AccountType = 'checking' | 'savings'
export type IncomeFrequency = 'monthly' | 'biweekly'
export type ExpenseType = 'one_time' | 'subscription'
export type BillingCycle = 'monthly' | 'yearly'
export type ExpenseCategory =
  | 'housing'
  | 'groceries'
  | 'transportation'
  | 'utilities'
  | 'bill'
  | 'subscriptions'
  | 'entertainment'
  | 'dining_out'
  | 'health'
  | 'shopping'
  | 'other'

// NOTE: these are `type` aliases, not `interface`s, deliberately — the Supabase
// client's generic default resolution fails to extend `GenericSchema` (and silently
// collapses every table's Row/Insert/Update to `never`) when `Row` references a
// named interface instead of a plain object type literal.
export type IncomeRow = {
  id: string
  user_id: string
  source_name: string
  amount: number
  frequency: IncomeFrequency
  created_at: string
}

export type ExpenseRow = {
  id: string
  user_id: string
  name: string
  amount: number
  type: ExpenseType
  billing_cycle: BillingCycle | null
  category: ExpenseCategory
  /** Anchor date this subscription bills on (day-of-month/day-of-year) — used to
   * project the next renewal. Null for one-time expenses and un-set subscriptions. */
  billing_date: string | null
  account_id: string | null
  created_at: string
}

export type SavingsGoalRow = {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string | null
  created_at: string
}

export type SavingsSnapshotRow = {
  id: string
  user_id: string
  amount: number
  recorded_at: string
}

export type BudgetLimitRow = {
  id: string
  user_id: string
  category: ExpenseCategory
  monthly_limit: number
  created_at: string
}

export type AccountRow = {
  id: string
  user_id: string
  name: string
  type: AccountType
  balance: number
  created_at: string
}

export type IncomeAllocationRow = {
  id: string
  user_id: string
  income_id: string
  account_id: string
  amount: number
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      income: {
        Row: IncomeRow
        Insert: Omit<IncomeRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<IncomeRow, 'id' | 'user_id'>>
        Relationships: []
      }
      expenses: {
        Row: ExpenseRow
        Insert: Omit<ExpenseRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<ExpenseRow, 'id' | 'user_id'>>
        Relationships: []
      }
      savings_goals: {
        Row: SavingsGoalRow
        Insert: Omit<SavingsGoalRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<SavingsGoalRow, 'id' | 'user_id'>>
        Relationships: []
      }
      savings_snapshots: {
        Row: SavingsSnapshotRow
        Insert: Omit<SavingsSnapshotRow, 'id'> & { id?: string }
        Update: Partial<Omit<SavingsSnapshotRow, 'id' | 'user_id'>>
        Relationships: []
      }
      budget_limits: {
        Row: BudgetLimitRow
        Insert: Omit<BudgetLimitRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<BudgetLimitRow, 'id' | 'user_id'>>
        Relationships: []
      }
      accounts: {
        Row: AccountRow
        Insert: Omit<AccountRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<AccountRow, 'id' | 'user_id'>>
        Relationships: []
      }
      income_allocations: {
        Row: IncomeAllocationRow
        Insert: Omit<IncomeAllocationRow, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<IncomeAllocationRow, 'id' | 'user_id'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
