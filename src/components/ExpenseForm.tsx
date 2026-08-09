import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ExpenseInput } from '../hooks/useExpenses'

const expenseSchema = z
  .object({
    name: z.string().trim().min(1, 'Expense name is required'),
    amount: z.coerce.number().positive('Amount must be greater than 0'),
    type: z.enum(['one_time', 'subscription']),
    billing_cycle: z.enum(['monthly', 'yearly']).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'subscription' && !data.billing_cycle) {
      ctx.addIssue({
        code: 'custom',
        message: 'Choose a billing cycle for this subscription',
        path: ['billing_cycle'],
      })
    }
  })

type ExpenseFormInput = z.input<typeof expenseSchema>
type ExpenseFormValues = z.output<typeof expenseSchema>

export interface ExpenseFormDefaults {
  name: string
  amount: number
  type: ExpenseFormValues['type']
  billing_cycle?: ExpenseFormValues['billing_cycle']
}

interface ExpenseFormProps {
  defaultValues?: ExpenseFormDefaults
  submitLabel: string
  onSubmit: (values: ExpenseInput) => Promise<{ error: string | null }>
  onCancel: () => void
}

const TYPE_OPTIONS = [
  { value: 'one_time', label: 'One-time' },
  { value: 'subscription', label: 'Subscription' },
] as const

const BILLING_CYCLE_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const

const EMPTY_DEFAULTS: ExpenseFormDefaults = { name: '', amount: 0, type: 'one_time' }

function ExpenseForm({ defaultValues, submitLabel, onSubmit, onCancel }: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: defaultValues ?? EMPTY_DEFAULTS,
  })

  useEffect(() => {
    if (defaultValues) reset(defaultValues)
  }, [defaultValues, reset])

  const type = watch('type')
  const billingCycle = watch('billing_cycle')

  async function submit(values: ExpenseFormValues) {
    const result = await onSubmit({
      name: values.name,
      amount: values.amount,
      type: values.type,
      billing_cycle: values.type === 'subscription' ? (values.billing_cycle ?? null) : null,
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
        <label htmlFor="name" className="text-sm font-medium text-espresso">
          Expense name
        </label>
        <input
          id="name"
          {...register('name')}
          className="rounded-lg border border-latte bg-white px-3 py-2 text-espresso outline-none focus:border-caramel"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="amount" className="text-sm font-medium text-espresso">
          Cost
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          {...register('amount')}
          className="rounded-lg border border-latte bg-white px-3 py-2 text-espresso outline-none focus:border-caramel"
        />
        {errors.amount && <p className="text-sm text-red-600">{errors.amount.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-espresso">Type</span>
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

      {type === 'subscription' && (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-espresso">Billing cycle</span>
          <div className="inline-flex w-fit rounded-full border border-latte p-1">
            {BILLING_CYCLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue('billing_cycle', option.value, { shouldValidate: true })}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  billingCycle === option.value
                    ? 'bg-espresso text-white'
                    : 'text-caramel hover:bg-latte'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {errors.billing_cycle && (
            <p className="text-sm text-red-600">{errors.billing_cycle.message}</p>
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

export default ExpenseForm
