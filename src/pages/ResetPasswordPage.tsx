import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

function ResetPasswordPage() {
  const { updatePassword, completePasswordRecovery } = useAuth()
  const [success, setSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) })

  async function submit(values: ResetPasswordValues) {
    const result = await updatePassword(values.password)
    if (result.error) {
      setError('root', { message: result.error })
      return
    }
    setSuccess(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm rounded-2xl border border-latte bg-cream p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-espresso">Set a new password</h1>

        {success ? (
          <>
            <p className="mt-4 text-sm text-espresso">
              Your password has been updated.
            </p>
            <button
              type="button"
              onClick={completePasswordRecovery}
              className="mt-6 rounded-full bg-espresso px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-caramel"
            >
              Continue to Budgy
            </button>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-caramel">Choose a new password for your account.</p>
            <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(submit)}>
              <label className="flex flex-col gap-1 text-sm text-espresso">
                New password
                <input
                  type="password"
                  {...register('password')}
                  className="rounded-lg border border-latte bg-white px-3 py-2 text-espresso outline-none focus:border-caramel"
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </label>

              <label className="flex flex-col gap-1 text-sm text-espresso">
                Confirm password
                <input
                  type="password"
                  {...register('confirmPassword')}
                  className="rounded-lg border border-latte bg-white px-3 py-2 text-espresso outline-none focus:border-caramel"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </label>

              {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-espresso px-4 py-2 font-medium text-white transition-colors hover:bg-caramel disabled:opacity-60"
              >
                {isSubmitting ? 'Saving…' : 'Update password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordPage
