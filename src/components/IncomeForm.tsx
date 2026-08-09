import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { IncomeInput } from '../hooks/useIncome'

const incomeSchema = z.object({
  source_name: z.string().trim().min(1, 'Company/source name is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  frequency: z.enum(['monthly', 'biweekly']),
})

type IncomeFormInput = z.input<typeof incomeSchema>
type IncomeFormValues = z.output<typeof incomeSchema>

interface IncomeFormProps {
  defaultValues?: IncomeFormValues
  submitLabel: string
  onSubmit: (values: IncomeInput) => Promise<{ error: string | null }>
  onCancel: () => void
}

const FREQUENCY_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'biweekly', label: 'Bi-weekly' },
] as const

function IncomeForm({ defaultValues, submitLabel, onSubmit, onCancel }: IncomeFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<IncomeFormInput, unknown, IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: defaultValues ?? { source_name: '', amount: 0, frequency: 'monthly' },
  })

  useEffect(() => {
    if (defaultValues) reset(defaultValues)
  }, [defaultValues, reset])

  const frequency = watch('frequency')

  async function submit(values: IncomeFormValues) {
    const result = await onSubmit(values)
    if (result.error) {
      setError('root', { message: result.error })
      return
    }
    reset({ source_name: '', amount: 0, frequency: 'monthly' })
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="flex flex-col gap-4 rounded-2xl border border-latte bg-cream p-6"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="source_name" className="text-sm font-medium text-espresso">
          Company / source name
        </label>
        <input
          id="source_name"
          {...register('source_name')}
          className="rounded-lg border border-latte bg-white px-3 py-2 text-espresso outline-none focus:border-caramel"
        />
        {errors.source_name && (
          <p className="text-sm text-red-600">{errors.source_name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="amount" className="text-sm font-medium text-espresso">
          Pay amount
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
        <span className="text-sm font-medium text-espresso">Frequency</span>
        <div className="inline-flex w-fit rounded-full border border-latte p-1">
          {FREQUENCY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setValue('frequency', option.value, { shouldValidate: true })}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                frequency === option.value
                  ? 'bg-espresso text-white'
                  : 'text-caramel hover:bg-latte'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
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

export default IncomeForm
