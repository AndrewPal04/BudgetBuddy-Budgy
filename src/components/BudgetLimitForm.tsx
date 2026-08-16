import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CATEGORY_LABELS, CATEGORY_VALUES } from '../lib/expenseCategories'

const budgetLimitSchema = z.object({
  category: z.enum(CATEGORY_VALUES),
  monthly_limit: z.coerce.number().positive('Limit must be greater than 0'),
})

type BudgetLimitFormInput = z.input<typeof budgetLimitSchema>
type BudgetLimitFormValues = z.output<typeof budgetLimitSchema>

export interface BudgetLimitFormDefaults {
  category: BudgetLimitFormValues['category']
  monthly_limit: number
}

interface BudgetLimitFormProps {
  defaultValues?: BudgetLimitFormDefaults
  lockCategory?: boolean
  submitLabel: string
  onSubmit: (values: BudgetLimitFormValues) => Promise<{ error: string | null }>
  onCancel: () => void
}

const EMPTY_DEFAULTS: BudgetLimitFormDefaults = { category: 'other', monthly_limit: 0 }

function BudgetLimitForm({
  defaultValues,
  lockCategory,
  submitLabel,
  onSubmit,
  onCancel,
}: BudgetLimitFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BudgetLimitFormInput, unknown, BudgetLimitFormValues>({
    resolver: zodResolver(budgetLimitSchema),
    defaultValues: defaultValues ?? EMPTY_DEFAULTS,
  })

  useEffect(() => {
    if (defaultValues) reset(defaultValues)
  }, [defaultValues, reset])

  async function submit(values: BudgetLimitFormValues) {
    const result = await onSubmit(values)
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
        <label htmlFor="limit-category" className="text-sm font-medium text-espresso">
          Category
        </label>
        <select
          id="limit-category"
          disabled={lockCategory}
          {...register('category')}
          className="rounded-lg border border-latte bg-white px-3 py-2 text-espresso outline-none focus:border-caramel disabled:opacity-60"
        >
          {CATEGORY_VALUES.map((value) => (
            <option key={value} value={value}>
              {CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="monthly_limit" className="text-sm font-medium text-espresso">
          Monthly limit
        </label>
        <input
          id="monthly_limit"
          type="number"
          step="0.01"
          {...register('monthly_limit')}
          className="rounded-lg border border-latte bg-white px-3 py-2 text-espresso outline-none focus:border-caramel"
        />
        {errors.monthly_limit && (
          <p className="text-sm text-red-600">{errors.monthly_limit.message}</p>
        )}
      </div>

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

export default BudgetLimitForm
