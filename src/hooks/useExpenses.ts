import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { BillingCycle, ExpenseRow, ExpenseType } from '../types/database'

export interface ExpenseInput {
  name: string
  amount: number
  type: ExpenseType
  billing_cycle: BillingCycle | null
}

interface MutationResult {
  error: string | null
}

export function useExpenses() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<ExpenseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!supabase || !user) {
      setEntries([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setError(null)
      // Postgres numeric columns come back as strings over PostgREST.
      setEntries((data ?? []).map((row) => ({ ...row, amount: Number(row.amount) })))
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    void refetch()
  }, [refetch])

  async function addExpense(input: ExpenseInput): Promise<MutationResult> {
    if (!supabase || !user) return { error: 'You must be signed in.' }
    const { error: insertError } = await supabase
      .from('expenses')
      .insert({ ...input, user_id: user.id })
    if (insertError) return { error: insertError.message }
    await refetch()
    return { error: null }
  }

  async function updateExpense(id: string, input: ExpenseInput): Promise<MutationResult> {
    if (!supabase) return { error: 'You must be signed in.' }
    const { error: updateError } = await supabase.from('expenses').update(input).eq('id', id)
    if (updateError) return { error: updateError.message }
    await refetch()
    return { error: null }
  }

  async function deleteExpense(id: string): Promise<MutationResult> {
    if (!supabase) return { error: 'You must be signed in.' }
    const { error: deleteError } = await supabase.from('expenses').delete().eq('id', id)
    if (deleteError) return { error: deleteError.message }
    await refetch()
    return { error: null }
  }

  return { entries, loading, error, addExpense, updateExpense, deleteExpense, refetch }
}
