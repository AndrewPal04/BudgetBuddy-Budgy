import { useCallback, useEffect, useState } from 'react'
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

export function useIncome() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<IncomeRow[]>([])
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
      .from('income')
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

  async function addIncome(input: IncomeInput): Promise<MutationResult> {
    if (!supabase || !user) return { error: 'You must be signed in.' }
    const { error: insertError } = await supabase
      .from('income')
      .insert({ ...input, user_id: user.id })
    if (insertError) return { error: insertError.message }
    await refetch()
    return { error: null }
  }

  async function updateIncome(id: string, input: IncomeInput): Promise<MutationResult> {
    if (!supabase) return { error: 'You must be signed in.' }
    const { error: updateError } = await supabase.from('income').update(input).eq('id', id)
    if (updateError) return { error: updateError.message }
    await refetch()
    return { error: null }
  }

  async function deleteIncome(id: string): Promise<MutationResult> {
    if (!supabase) return { error: 'You must be signed in.' }
    const { error: deleteError } = await supabase.from('income').delete().eq('id', id)
    if (deleteError) return { error: deleteError.message }
    await refetch()
    return { error: null }
  }

  return { entries, loading, error, addIncome, updateIncome, deleteIncome, refetch }
}
