import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ExpenseInput } from '../hooks/useExpenses'
import { useAccounts } from '../hooks/useAccounts'
import { CATEGORY_LABELS, CATEGORY_VALUES } from '../lib/expenseCategories'

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  checking: 'Checking',
  savings: 'Savings',
}

const expenseSchema = z
  .object({
    name: z.string().trim().min(1, 'Expense name is required'),
    amount: z.coerce.number().positive('Amount must be greater than 0'),
    type: z.enum(['one_time', 'subscription']),
    billing_cycle: z.enum(['monthly', 'yearly']).optional(),
    billing_date: z.string().optional(),
    category: z.enum(CATEGORY_VALUES),
    account_id: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'subscription' && !data.billing_cycle) {
      ctx.addIssue({
        code: 'custom',
        message: 'Choose a billing cycle for this subscription',
        path: ['billing_cycle'],
      })
    }
    if (data.type === 'subscription' && !data.billing_date) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a date this subscription bills on',
        path: ['billing_date'],
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
  billing_date?: string
  category: ExpenseFormValues['category']
  account_id?: string
}

interface ExpenseFormProps {
  defaultValues?: ExpenseFormDefaults
  submitLabel: string
  onSubmit: (values: ExpenseInput) => Promise<{ error: string | null }>
  onCancel: () => void
}

const TYPE_OPTIONS = [
  { value: 'one_time', label: 'One-time' },
  { value: 'subscription', label: 'Recurring' },
] as const

const BILLING_CYCLE_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const

const EMPTY_DEFAULTS: ExpenseFormDefaults = {
  name: '',
  amount: 0,
  type: 'one_time',
  category: 'other',
}

function ExpenseForm({ defaultValues, submitLabel, onSubmit, onCancel }: ExpenseFormProps) {
  const { accounts } = useAccounts()
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
      billing_date: values.type === 'subscription' ? (values.billing_date ?? null) : null,
      category: values.category,
      account_id: values.account_id ? values.account_id : null,
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
        <label htmlFor="category" className="text-sm font-medium text-espresso">
          Category
        </label>
        <select
          id="category"
          {...register('category')}
          className="rounded-lg border border-latte bg-white px-3 py-2 text-espresso outline-none focus:border-caramel"
        >
          {CATEGORY_VALUES.map((value) => (
            <option key={value} value={value}>
              {CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="account_id" className="text-sm font-medium text-espresso">
          Paid from account
        </label>
        <select
          id="account_id"
          {...register('account_id')}
          className="rounded-lg border border-latte bg-white px-3 py-2 text-espresso outline-none focus:border-caramel"
        >
          <option value="">Not tracked</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} ({ACCOUNT_TYPE_LABEL[account.type]})
            </option>
          ))}
        </select>
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

          <label htmlFor="billing_date" className="mt-3 text-sm font-medium text-espresso">
            Billing date
          </label>
          <input
            id="billing_date"
            type="date"
            {...register('billing_date')}
            className="w-fit rounded-lg border border-latte bg-white px-3 py-2 text-espresso outline-none focus:border-caramel"
          />
          <p className="text-xs text-caramel">
            Any date this bills on — we&apos;ll track the next renewal automatically.
          </p>
          {errors.billing_date && (
            <p className="text-sm text-red-600">{errors.billing_date.message}</p>
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
