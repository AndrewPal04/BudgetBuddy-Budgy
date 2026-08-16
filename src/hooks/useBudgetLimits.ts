import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { BudgetLimitRow, ExpenseCategory } from '../types/database'

interface MutationResult {
  error: string | null
}

async function fetchBudgetLimits(): Promise<BudgetLimitRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('budget_limits')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  // Postgres numeric columns come back as strings over PostgREST.
  return (data ?? []).map((row) => ({ ...row, monthly_limit: Number(row.monthly_limit) }))
}

export function useBudgetLimits() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['budget_limits', user?.id] as const

  const query = useQuery({
    queryKey,
    queryFn: fetchBudgetLimits,
    enabled: Boolean(supabase && user),
  })

  async function setLimit(category: ExpenseCategory, monthlyLimit: number): Promise<MutationResult> {
    if (!supabase || !user) return { error: 'You must be signed in.' }
    const { error } = await supabase
      .from('budget_limits')
      .upsert(
        { user_id: user.id, category, monthly_limit: monthlyLimit },
        { onConflict: 'user_id,category' },
      )
    if (error) return { error: error.message }
    await queryClient.invalidateQueries({ queryKey })
    return { error: null }
  }

  async function deleteLimit(id: string): Promise<MutationResult> {
    if (!supabase) return { error: 'You must be signed in.' }
    const { error } = await supabase.from('budget_limits').delete().eq('id', id)
    if (error) return { error: error.message }
    await queryClient.invalidateQueries({ queryKey })
    return { error: null }
  }

  return {
    limits: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    setLimit,
    deleteLimit,
    refetch: query.refetch,
  }
}
