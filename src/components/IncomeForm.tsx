import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { IncomeInput } from '../hooks/useIncome'
import { useAccounts } from '../hooks/useAccounts'

const incomeSchema = z.object({
  source_name: z.string().trim().min(1, 'Company/source name is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  frequency: z.enum(['monthly', 'biweekly']),
})

type IncomeFormInput = z.input<typeof incomeSchema>
type IncomeFormValues = z.output<typeof incomeSchema>

export interface IncomeFormAllocationDefault {
  account_id: string
  amount: number
}

interface IncomeFormProps {
  defaultValues?: IncomeFormValues & { allocations?: IncomeFormAllocationDefault[] }
  submitLabel: string
  onSubmit: (values: IncomeInput) => Promise<{ error: string | null }>
  onCancel: () => void
}

const FREQUENCY_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'biweekly', label: 'Bi-weekly' },
] as const

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  checking: 'Checking',
  savings: 'Savings',
}

function centsEqual(a: number, b: number) {
  return Math.round(a * 100) === Math.round(b * 100)
}

function IncomeForm({ defaultValues, submitLabel, onSubmit, onCancel }: IncomeFormProps) {
  const { accounts } = useAccounts()
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(
    defaultValues?.allocations?.map((allocation) => allocation.account_id) ?? [],
  )
  const [allocationAmounts, setAllocationAmounts] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const allocation of defaultValues?.allocations ?? []) {
      initial[allocation.account_id] = String(allocation.amount)
    }
    return initial
  })
  const [allocationError, setAllocationError] = useState<string | null>(null)

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
    setSelectedAccountIds(defaultValues?.allocations?.map((allocation) => allocation.account_id) ?? [])
    const initial: Record<string, string> = {}
    for (const allocation of defaultValues?.allocations ?? []) {
      initial[allocation.account_id] = String(allocation.amount)
    }
    setAllocationAmounts(initial)
  }, [defaultValues, reset])

  const frequency = watch('frequency')
  const amount = watch('amount')
  const totalAmount = Number(amount) || 0

  function toggleAccount(accountId: string) {
    setAllocationError(null)
    setSelectedAccountIds((current) =>
      current.includes(accountId)
        ? current.filter((id) => id !== accountId)
        : [...current, accountId],
    )
  }

  const allocatedTotal = selectedAccountIds.reduce(
    (sum, accountId) => sum + (Number(allocationAmounts[accountId]) || 0),
    0,
  )

  async function submit(values: IncomeFormValues) {
    setAllocationError(null)

    let allocations: { account_id: string; amount: number }[] = []
    if (selectedAccountIds.length === 1) {
      allocations = [{ account_id: selectedAccountIds[0], amount: values.amount }]
    } else if (selectedAccountIds.length > 1) {
      allocations = selectedAccountIds.map((accountId) => ({
        account_id: accountId,
        amount: Number(allocationAmounts[accountId]) || 0,
      }))
      const sum = allocations.reduce((total, allocation) => total + allocation.amount, 0)
      if (allocations.some((allocation) => allocation.amount <= 0)) {
        setAllocationError('Enter an amount for each selected account.')
        return
      }
      if (!centsEqual(sum, values.amount)) {
        setAllocationError(
          `Account amounts must add up to ${currencyFormatter.format(values.amount)} (currently ${currencyFormatter.format(sum)}).`,
        )
        return
      }
    }

    const result = await onSubmit({ ...values, allocations })
    if (result.error) {
      setError('root', { message: result.error })
      return
    }
    reset({ source_name: '', amount: 0, frequency: 'monthly' })
    setSelectedAccountIds([])
    setAllocationAmounts({})
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

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-espresso">Which account(s) is this going to?</span>
        {accounts.length === 0 ? (
          <p className="text-sm text-caramel">
            You don&apos;t have any accounts yet.{' '}
            <Link to="/accounts" className="font-medium underline underline-offset-2">
              Add one
            </Link>{' '}
            to start tracking where your income goes.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {accounts.map((account) => {
              const checked = selectedAccountIds.includes(account.id)
              return (
                <label
                  key={account.id}
                  className="flex items-center gap-2 rounded-lg border border-latte bg-white px-3 py-2 text-sm text-espresso"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAccount(account.id)}
                    className="h-4 w-4 accent-espresso"
                  />
                  <span className="flex-1">
                    {account.name}{' '}
                    <span className="text-caramel">({ACCOUNT_TYPE_LABEL[account.type]})</span>
                  </span>
                  {checked && selectedAccountIds.length > 1 && (
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={allocationAmounts[account.id] ?? ''}
                      onChange={(event) => {
                        setAllocationError(null)
                        setAllocationAmounts((current) => ({
                          ...current,
                          [account.id]: event.target.value,
                        }))
                      }}
                      className="w-28 rounded-lg border border-latte bg-white px-2 py-1 text-right text-espresso outline-none focus:border-caramel"
                    />
                  )}
                </label>
              )
            })}

            {selectedAccountIds.length === 1 && (
              <p className="text-sm text-caramel">
                The full {currencyFormatter.format(totalAmount)} will be added to{' '}
                {accounts.find((account) => account.id === selectedAccountIds[0])?.name}.
              </p>
            )}

            {selectedAccountIds.length > 1 && (
              <p className={`text-sm ${centsEqual(allocatedTotal, totalAmount) ? 'text-caramel' : 'text-red-600'}`}>
                Allocated {currencyFormatter.format(allocatedTotal)} of{' '}
                {currencyFormatter.format(totalAmount)}
              </p>
            )}

            {allocationError && <p className="text-sm text-red-600">{allocationError}</p>}
          </div>
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

export default IncomeForm
