export type IncomeFrequency = 'monthly' | 'biweekly'
export type ExpenseType = 'one_time' | 'subscription'
export type BillingCycle = 'monthly' | 'yearly'

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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
