import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { isSupabaseConfigured } from '../lib/supabase'

type Mode = 'signIn' | 'signUp' | 'forgotPassword'

function AuthPage() {
  const { signIn, signUp, requestPasswordReset } = useAuth()
  const [mode, setMode] = useState<Mode>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setInfo(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)

    if (mode === 'forgotPassword') {
      const result = await requestPasswordReset(email)
      setSubmitting(false)
      if (result.error) {
        setError(result.error)
        return
      }
      setInfo('Check your email for a password reset link.')
      return
    }

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
          {mode === 'signIn'
            ? 'Sign in to your account'
            : mode === 'signUp'
              ? 'Create an account'
              : 'Reset your password'}
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

          {mode !== 'forgotPassword' && (
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
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-espresso">{info}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-espresso px-4 py-2 font-medium text-white transition-colors hover:bg-caramel disabled:opacity-60"
          >
            {submitting
              ? 'Please wait…'
              : mode === 'signIn'
                ? 'Sign in'
                : mode === 'signUp'
                  ? 'Sign up'
                  : 'Send reset link'}
          </button>
        </form>

        <div className="mt-4 flex flex-col items-start gap-2">
          {mode === 'signIn' && (
            <>
              <button
                type="button"
                className="text-sm text-caramel underline-offset-2 hover:underline"
                onClick={() => switchMode('forgotPassword')}
              >
                Forgot password?
              </button>
              <button
                type="button"
                className="text-sm text-caramel underline-offset-2 hover:underline"
                onClick={() => switchMode('signUp')}
              >
                Don&apos;t have an account? Sign up
              </button>
            </>
          )}
          {mode === 'signUp' && (
            <button
              type="button"
              className="text-sm text-caramel underline-offset-2 hover:underline"
              onClick={() => switchMode('signIn')}
            >
              Already have an account? Sign in
            </button>
          )}
          {mode === 'forgotPassword' && (
            <button
              type="button"
              className="text-sm text-caramel underline-offset-2 hover:underline"
              onClick={() => switchMode('signIn')}
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthPage
