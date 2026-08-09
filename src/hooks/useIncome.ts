import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { IncomeFrequency, IncomeRow } from '../types/database'

export interface IncomeInput {
  source_name: string
  amount: number
  frequency: IncomeFrequency
}

interface MutationResult {
  error: string | null
}

async function fetchIncome(): Promise<IncomeRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('income')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  // Postgres numeric columns come back as strings over PostgREST.
  return (data ?? []).map((row) => ({ ...row, amount: Number(row.amount) }))
}

export function useIncome() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['income', user?.id] as const

  const query = useQuery({
    queryKey,
    queryFn: fetchIncome,
    enabled: Boolean(supabase && user),
  })

  async function addIncome(input: IncomeInput): Promise<MutationResult> {
    if (!supabase || !user) return { error: 'You must be signed in.' }
    const { error } = await supabase.from('income').insert({ ...input, user_id: user.id })
    if (error) return { error: error.message }
    await queryClient.invalidateQueries({ queryKey })
    return { error: null }
  }

  async function updateIncome(id: string, input: IncomeInput): Promise<MutationResult> {
    if (!supabase) return { error: 'You must be signed in.' }
    const { error } = await supabase.from('income').update(input).eq('id', id)
    if (error) return { error: error.message }
    await queryClient.invalidateQueries({ queryKey })
    return { error: null }
  }

  async function deleteIncome(id: string): Promise<MutationResult> {
    if (!supabase) return { error: 'You must be signed in.' }
    const { error } = await supabase.from('income').delete().eq('id', id)
    if (error) return { error: error.message }
    await queryClient.invalidateQueries({ queryKey })
    return { error: null }
  }

  return {
    entries: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    addIncome,
    updateIncome,
    deleteIncome,
    refetch: query.refetch,
  }
}
