import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { AccountInput } from '../hooks/useAccounts'

const accountSchema = z.object({
  name: z.string().trim().min(1, 'Account name is required'),
  type: z.enum(['checking', 'savings']),
  balance: z.coerce.number().min(0, 'Must be 0 or more'),
  interest_rate: z.string().optional(),
})

type AccountFormInput = z.input<typeof accountSchema>
type AccountFormValues = z.output<typeof accountSchema>

export interface AccountFormDefaults {
  name: string
  type: AccountFormValues['type']
  balance: number
  interest_rate?: string
}

interface AccountFormProps {
  defaultValues?: AccountFormDefaults
  submitLabel: string
  onSubmit: (values: AccountInput) => Promise<{ error: string | null }>
  onCancel: () => void
}

const TYPE_OPTIONS = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
] as const

const EMPTY_DEFAULTS: AccountFormDefaults = {
  name: '',
  type: 'checking',
  balance: 0,
  interest_rate: '',
}

function AccountForm({ defaultValues, submitLabel, onSubmit, onCancel }: AccountFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormInput, unknown, AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: defaultValues ?? EMPTY_DEFAULTS,
  })

  useEffect(() => {
    if (defaultValues) reset(defaultValues)
  }, [defaultValues, reset])

  const type = watch('type')

  async function submit(values: AccountFormValues) {
    let interestRate: number | null = null
    if (values.type === 'savings' && values.interest_rate) {
      const parsed = Number(values.interest_rate)
      if (Number.isNaN(parsed) || parsed < 0) {
        setError('interest_rate', { message: 'Enter a valid interest rate (0 or more)' })
        return
      }
      interestRate = parsed
    }

    const result = await onSubmit({
      name: values.name,
      type: values.type,
      balance: values.balance,
      interest_rate: interestRate,
    })
    if (result.error) {
      setError('root', { message: result.error })
      return
    }
    reset(EMPTY_DEFAULTS)
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="flex flex-col gap-4 rounded-2xl border border-latte bg-cream p-6"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="account-name" className="text-sm font-medium text-espresso">
          Account name
        </label>
        <input
          id="account-name"
          placeholder="e.g. Everyday Checking"
          {...register('name')}
          className="rounded-lg border border-latte bg-white px-3 py-2 text-espresso outline-none focus:border-caramel"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-espresso">Account type</span>
        <div className="inline-flex w-fit rounded-full border border-latte p-1">
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setValue('type', option.value, { shouldValidate: true })}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                type === option.value ? 'bg-espresso text-white' : 'text-caramel hover:bg-latte'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="balance" className="text-sm font-medium text-espresso">
          Current balance
        </label>
        <input
          id="balance"
          type="number"
          step="0.01"
          {...register('balance')}
          className="rounded-lg border border-latte bg-white px-3 py-2 text-espresso outline-none focus:border-caramel"
        />
        {errors.balance && <p className="text-sm text-red-600">{errors.balance.message}</p>}
      </div>

      {type === 'savings' && (
        <div className="flex flex-col gap-1">
          <label htmlFor="interest_rate" className="text-sm font-medium text-espresso">
            Interest rate (APR %, optional)
          </label>
          <input
            id="interest_rate"
            type="number"
            step="0.01"
            min="0"
            placeholder="0"
            {...register('interest_rate')}
            className="rounded-lg border border-latte bg-white px-3 py-2 text-espresso outline-none focus:border-caramel"
          />
          <p className="text-xs text-caramel">Leave blank to assume 0% growth.</p>
          {errors.interest_rate && (
            <p className="text-sm text-red-600">{errors.interest_rate.message}</p>
          )}
        </div>
      )}

      {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-espresso px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-caramel disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-latte px-4 py-2 text-sm font-medium text-espresso transition-colors hover:bg-latte"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default AccountForm
