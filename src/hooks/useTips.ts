import { useState } from 'react'
import { supabase } from '../lib/supabase'

export interface GenerateTipsInput {
  monthlyIncome: number
  monthlyExpenses: number
  topExpenses: { name: string; amount: number }[]
  goals: {
    name: string
    targetAmount: number
    currentAmount: number
    targetDate: string | null
    onTrack: boolean
  }[]
}

interface EdgeFunctionResponse {
  tips?: string[]
  error?: string
}

export function useTips() {
  const [tips, setTips] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate(input: GenerateTipsInput) {
    if (!supabase) {
      setError('Supabase is not configured.')
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: invokeError } = await supabase.functions.invoke<EdgeFunctionResponse>(
      'generate-tips',
      { body: input },
    )

    setLoading(false)

    if (invokeError) {
      setError(invokeError.message || 'Could not generate tips right now.')
      return
    }
    if (data?.error) {
      setError(data.error)
      return
    }

    setTips(Array.isArray(data?.tips) ? data.tips : [])
  }

  return { tips, loading, error, generate }
}
