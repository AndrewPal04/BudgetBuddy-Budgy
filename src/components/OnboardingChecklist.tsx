import { useState } from 'react'
import { Link } from 'react-router-dom'

const DISMISSED_KEY = 'budgy_onboarding_dismissed'

interface OnboardingChecklistProps {
  hasIncome: boolean
  hasExpense: boolean
  hasGoal: boolean
}

interface Step {
  key: string
  label: string
  done: boolean
  to: string
  cta: string
}

function OnboardingChecklist({ hasIncome, hasExpense, hasGoal }: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === 'true',
  )

  const steps: Step[] = [
    { key: 'income', label: 'Add your income', done: hasIncome, to: '/income', cta: 'Add income' },
    { key: 'expense', label: 'Log an expense', done: hasExpense, to: '/expenses', cta: 'Add expense' },
    { key: 'goal', label: 'Set a savings goal', done: hasGoal, to: '/savings', cta: 'Set a goal' },
  ]

  const doneCount = steps.filter((step) => step.done).length

  if (dismissed || doneCount === steps.length) return null

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setDismissed(true)
  }

  return (
    <div className="rounded-2xl border border-latte bg-cream p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-espresso">Welcome to Budgy</h2>
          <p className="mt-1 text-sm text-caramel">
            Get set up in a few steps ({doneCount} of {steps.length} done).
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-sm font-medium text-caramel underline-offset-2 hover:underline"
        >
          Dismiss
        </button>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {steps.map((step) => (
          <li
            key={step.key}
            className="flex items-center justify-between gap-4 rounded-xl border border-latte bg-white px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                  step.done ? 'bg-espresso text-white' : 'border border-latte text-transparent'
                }`}
              >
                ✓
              </span>
              <span className={step.done ? 'text-espresso line-through' : 'text-espresso'}>
                {step.label}
              </span>
            </div>
            {!step.done && (
              <Link
                to={step.to}
                className="shrink-0 rounded-full bg-espresso px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-caramel"
              >
                {step.cta}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default OnboardingChecklist
