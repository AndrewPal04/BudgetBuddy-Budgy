import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { AccountRow, AccountType } from '../types/database'

export interface AccountInput {
  name: string
  type: AccountType
  balance: number
}

interface MutationResult {
  error: string | null
}

async function fetchAccounts(): Promise<AccountRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  // Postgres numeric columns come back as strings over PostgREST.
  return (data ?? []).map((row) => ({
    ...row,
    balance: Number(row.balance),
  }))
}

export function useAccounts() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['accounts', user?.id] as const

  const query = useQuery({
    queryKey,
    queryFn: fetchAccounts,
    enabled: Boolean(supabase && user),
  })

  async function addAccount(input: AccountInput): Promise<MutationResult> {
    if (!supabase || !user) return { error: 'You must be signed in.' }
    const { error } = await supabase.from('accounts').insert({ ...input, user_id: user.id })
    if (error) return { error: error.message }
    await queryClient.invalidateQueries({ queryKey })
    return { error: null }
  }

  async function updateAccount(id: string, input: AccountInput): Promise<MutationResult> {
    if (!supabase) return { error: 'You must be signed in.' }
    const { error } = await supabase.from('accounts').update(input).eq('id', id)
    if (error) return { error: error.message }
    await queryClient.invalidateQueries({ queryKey })
    return { error: null }
  }

  async function deleteAccount(id: string): Promise<MutationResult> {
    if (!supabase) return { error: 'You must be signed in.' }
    const { error } = await supabase.from('accounts').delete().eq('id', id)
    if (error) return { error: error.message }
    await queryClient.invalidateQueries({ queryKey })
    return { error: null }
  }

  return {
    accounts: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    addAccount,
    updateAccount,
    deleteAccount,
    refetch: query.refetch,
  }
}
