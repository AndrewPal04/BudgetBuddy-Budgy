import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { SavingsGoalInput } from '../hooks/useSavingsGoals'

const savingsGoalSchema = z.object({
  name: z.string().trim().min(1, 'Goal name is required'),
  target_amount: z.coerce.number().positive('Target amount must be greater than 0'),
  current_amount: z.coerce.number().min(0, 'Must be 0 or more'),
  target_date: z.string(),
})

type SavingsGoalFormInput = z.input<typeof savingsGoalSchema>
type SavingsGoalFormValues = z.output<typeof savingsGoalSchema>

export interface SavingsGoalFormDefaults {
  name: string
  target_amount: number
  current_amount: number
  target_date: string
}

interface SavingsGoalFormProps {
  defaultValues?: SavingsGoalFormDefaults
  submitLabel: string
  onSubmit: (values: SavingsGoalInput) => Promise<{ error: string | null }>
  onCancel: () => void
}

const EMPTY_DEFAULTS: SavingsGoalFormDefaults = {
  name: '',
  target_amount: 0,
  current_amount: 0,
  target_date: '',
}

function SavingsGoalForm({ defaultValues, submitLabel, onSubmit, onCancel }: SavingsGoalFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SavingsGoalFormInput, unknown, SavingsGoalFormValues>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: defaultValues ?? EMPTY_DEFAULTS,
  })

  useEffect(() => {
    if (defaultValues) reset(defaultValues)
  }, [defaultValues, reset])

  async function submit(values: SavingsGoalFormValues) {
    const result = await onSubmit({
      name: values.name,
      target_amount: values.target_amount,
      current_amount: values.current_amount,
      target_date: values.target_date ? values.target_date : null,
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
        <label htmlFor="goal-name" className="text-sm font-medium text-espresso">
          Goal name
        </label>
        <input
          id="goal-name"
          {...register('name')}
          className="rounded-lg border border-latte bg-white px-3 py-2 text-espresso outline-none focus:border-caramel"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="target_amount" className="text-sm font-medium text-espresso">
            Target amount
          </label>
          <input
            id="target_amount"
            type="number"
            step="0.01"
            {...register('target_amount')}
            className="rounded-lg border border-latte bg-white px-3 py-2 text-espresso outline-none focus:border-caramel"
          />
          {errors.target_amount && (
            <p className="text-sm text-red-600">{errors.target_amount.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="current_amount" className="text-sm font-medium text-espresso">
            Already saved
          </label>
          <input
            id="current_amount"
            type="number"
            step="0.01"
            {...register('current_amount')}
            className="rounded-lg border border-latte bg-white px-3 py-2 text-espresso outline-none focus:border-caramel"
          />
          {errors.current_amount && (
            <p className="text-sm text-red-600">{errors.current_amount.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="target_date" className="text-sm font-medium text-espresso">
          Target date (optional)
        </label>
        <input
          id="target_date"
          type="date"
          {...register('target_date')}
          className="w-fit rounded-lg border border-latte bg-white px-3 py-2 text-espresso outline-none focus:border-caramel"
        />
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

export default SavingsGoalForm
