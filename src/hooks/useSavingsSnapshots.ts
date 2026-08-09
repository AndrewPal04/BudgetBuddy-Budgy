import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { SavingsSnapshotRow } from '../types/database'

async function fetchSavingsSnapshots(): Promise<SavingsSnapshotRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('savings_snapshots')
    .select('*')
    .order('recorded_at', { ascending: true })

  if (error) throw new Error(error.message)
  // Postgres numeric columns come back as strings over PostgREST.
  return (data ?? []).map((row) => ({ ...row, amount: Number(row.amount) }))
}

/** Read-only: nothing in the app writes snapshots yet, but the trend chart uses the
 * latest one as its starting baseline if any exist. */
export function useSavingsSnapshots() {
  const { user } = useAuth()

  const query = useQuery({
    queryKey: ['savings_snapshots', user?.id] as const,
    queryFn: fetchSavingsSnapshots,
    enabled: Boolean(supabase && user),
  })

  return {
    snapshots: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  }
}
