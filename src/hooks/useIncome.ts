import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { IncomeAllocationRow, IncomeFrequency, IncomeRow } from '../types/database'

export interface IncomeAllocationInput {
  account_id: string
  amount: number
}

export interface IncomeInput {
  source_name: string
  amount: number
  frequency: IncomeFrequency
  allocations: IncomeAllocationInput[]
}

export type IncomeEntry = IncomeRow & { allocations: IncomeAllocationRow[] }

interface MutationResult {
  error: string | null
}

async function fetchIncome(): Promise<IncomeEntry[]> {
  if (!supabase) return []
  const [incomeResult, allocationsResult] = await Promise.all([
    supabase.from('income').select('*').order('created_at', { ascending: false }),
    supabase.from('income_allocations').select('*'),
  ])

  if (incomeResult.error) throw new Error(incomeResult.error.message)
  if (allocationsResult.error) throw new Error(allocationsResult.error.message)

  const allocationsByIncomeId = new Map<string, IncomeAllocationRow[]>()
  for (const row of allocationsResult.data ?? []) {
    const allocation: IncomeAllocationRow = { ...row, amount: Number(row.amount) }
    const list = allocationsByIncomeId.get(allocation.income_id) ?? []
    list.push(allocation)
    allocationsByIncomeId.set(allocation.income_id, list)
  }

  // Postgres numeric columns come back as strings over PostgREST.
  return (incomeResult.data ?? []).map((row) => ({
    ...row,
    amount: Number(row.amount),
    allocations: allocationsByIncomeId.get(row.id) ?? [],
  }))
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

  async function invalidate() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey }),
      queryClient.invalidateQueries({ queryKey: ['accounts', user?.id] }),
    ])
  }

  async function addIncome(input: IncomeInput): Promise<MutationResult> {
    if (!supabase || !user) return { error: 'You must be signed in.' }
    const { allocations, ...incomeFields } = input
    const { data, error } = await supabase
      .from('income')
      .insert({ ...incomeFields, user_id: user.id })
      .select('id')
      .single()
    if (error) return { error: error.message }

    if (allocations.length > 0) {
      const { error: allocationError } = await supabase.from('income_allocations').insert(
        allocations.map((allocation) => ({
          income_id: data.id,
          account_id: allocation.account_id,
          amount: allocation.amount,
          user_id: user.id,
        })),
      )
      if (allocationError) return { error: allocationError.message }
    }

    await invalidate()
    return { error: null }
  }

  async function updateIncome(id: string, input: IncomeInput): Promise<MutationResult> {
    if (!supabase || !user) return { error: 'You must be signed in.' }
    const { allocations, ...incomeFields } = input
    const { error } = await supabase.from('income').update(incomeFields).eq('id', id)
    if (error) return { error: error.message }

    const { error: deleteError } = await supabase
      .from('income_allocations')
      .delete()
      .eq('income_id', id)
    if (deleteError) return { error: deleteError.message }

    if (allocations.length > 0) {
      const { error: insertError } = await supabase.from('income_allocations').insert(
        allocations.map((allocation) => ({
          income_id: id,
          account_id: allocation.account_id,
          amount: allocation.amount,
          user_id: user.id,
        })),
      )
      if (insertError) return { error: insertError.message }
    }

    await invalidate()
    return { error: null }
  }

  async function deleteIncome(id: string): Promise<MutationResult> {
    if (!supabase) return { error: 'You must be signed in.' }
    const { error } = await supabase.from('income').delete().eq('id', id)
    if (error) return { error: error.message }
    await invalidate()
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
