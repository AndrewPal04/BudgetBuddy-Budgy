import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { isSupabaseConfigured } from '../lib/supabase'

function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)
    const result = mode === 'signIn' ? await signIn(email, password) : await signUp(email, password)
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }
    if (mode === 'signUp') {
      setInfo('Account created — check your email to confirm, then sign in.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm rounded-2xl border border-latte bg-cream p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-espresso">Budgy the Budget Buddy</h1>
        <p className="mt-1 text-sm text-caramel">
          {mode === 'signIn' ? 'Sign in to your account' : 'Create an account'}
        </p>

        {!isSupabaseConfigured && (
          <p className="mt-4 rounded-lg bg-latte px-3 py-2 text-sm text-espresso">
            Supabase isn&apos;t configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
            to .env, then restart the dev server.
          </p>
        )}

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm text-espresso">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-lg border border-latte bg-white px-3 py-2 text-espresso outline-none focus:border-caramel"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-espresso">
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-lg border border-latte bg-white px-3 py-2 text-espresso outline-none focus:border-caramel"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-espresso">{info}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-espresso px-4 py-2 font-medium text-white transition-colors hover:bg-caramel disabled:opacity-60"
          >
            {submitting ? 'Please wait…' : mode === 'signIn' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 text-sm text-caramel underline-offset-2 hover:underline"
          onClick={() => {
            setMode((current) => (current === 'signIn' ? 'signUp' : 'signIn'))
            setError(null)
            setInfo(null)
          }}
        >
          {mode === 'signIn'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}

export default AuthPage
