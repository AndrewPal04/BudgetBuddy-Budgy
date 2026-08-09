import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { SavingsGoalRow } from '../types/database'

export interface SavingsGoalInput {
  name: string
  target_amount: number
  current_amount: number
  target_date: string | null
}

interface MutationResult {
  error: string | null
}

async function fetchSavingsGoals(): Promise<SavingsGoalRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  // Postgres numeric columns come back as strings over PostgREST.
  return (data ?? []).map((row) => ({
    ...row,
    target_amount: Number(row.target_amount),
    current_amount: Number(row.current_amount),
  }))
}

export function useSavingsGoals() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['savings_goals', user?.id] as const

  const query = useQuery({
    queryKey,
    queryFn: fetchSavingsGoals,
    enabled: Boolean(supabase && user),
  })

  async function addGoal(input: SavingsGoalInput): Promise<MutationResult> {
    if (!supabase || !user) return { error: 'You must be signed in.' }
    const { error } = await supabase.from('savings_goals').insert({ ...input, user_id: user.id })
    if (error) return { error: error.message }
    await queryClient.invalidateQueries({ queryKey })
    return { error: null }
  }

  async function updateGoal(id: string, input: SavingsGoalInput): Promise<MutationResult> {
    if (!supabase) return { error: 'You must be signed in.' }
    const { error } = await supabase.from('savings_goals').update(input).eq('id', id)
    if (error) return { error: error.message }
    await queryClient.invalidateQueries({ queryKey })
    return { error: null }
  }

  async function deleteGoal(id: string): Promise<MutationResult> {
    if (!supabase) return { error: 'You must be signed in.' }
    const { error } = await supabase.from('savings_goals').delete().eq('id', id)
    if (error) return { error: error.message }
    await queryClient.invalidateQueries({ queryKey })
    return { error: null }
  }

  return {
    goals: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    addGoal,
    updateGoal,
    deleteGoal,
    refetch: query.refetch,
  }
}
