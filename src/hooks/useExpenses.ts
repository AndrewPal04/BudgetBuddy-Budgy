import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { BillingCycle, ExpenseCategory, ExpenseRow, ExpenseType } from '../types/database'

export interface ExpenseInput {
  name: string
  amount: number
  type: ExpenseType
  billing_cycle: BillingCycle | null
  category: ExpenseCategory
  billing_date: string | null
}

interface MutationResult {
  error: string | null
}

async function fetchExpenses(): Promise<ExpenseRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  // Postgres numeric columns come back as strings over PostgREST.
  return (data ?? []).map((row) => ({ ...row, amount: Number(row.amount) }))
}

export function useExpenses() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['expenses', user?.id] as const

  const query = useQuery({
    queryKey,
    queryFn: fetchExpenses,
    enabled: Boolean(supabase && user),
  })

  async function addExpense(input: ExpenseInput): Promise<MutationResult> {
    if (!supabase || !user) return { error: 'You must be signed in.' }
    const { error } = await supabase.from('expenses').insert({ ...input, user_id: user.id })
    if (error) return { error: error.message }
    await queryClient.invalidateQueries({ queryKey })
    return { error: null }
  }

  async function updateExpense(id: string, input: ExpenseInput): Promise<MutationResult> {
    if (!supabase) return { error: 'You must be signed in.' }
    const { error } = await supabase.from('expenses').update(input).eq('id', id)
    if (error) return { error: error.message }
    await queryClient.invalidateQueries({ queryKey })
    return { error: null }
  }

  async function deleteExpense(id: string): Promise<MutationResult> {
    if (!supabase) return { error: 'You must be signed in.' }
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) return { error: error.message }
    await queryClient.invalidateQueries({ queryKey })
    return { error: null }
  }

  return {
    entries: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: query.refetch,
  }
}
