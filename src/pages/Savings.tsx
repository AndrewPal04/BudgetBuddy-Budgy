import { useState } from 'react'
import { Link } from 'react-router-dom'
import SavingsTrendChart from '../components/SavingsTrendChart'
import SavingsGoalForm from '../components/SavingsGoalForm'
import ConfirmDialog from '../components/ConfirmDialog'
import { useSavingsGoals, type SavingsGoalInput } from '../hooks/useSavingsGoals'
import { useIncome } from '../hooks/useIncome'
import { useExpenses } from '../hooks/useExpenses'
import { useAccounts } from '../hooks/useAccounts'
import { monthlyExpenseTotal, monthlyIncomeTotal } from '../lib/budgetMath'
import { isGoalReachable } from '../lib/savingsMath'
import { buildAccountYearlyTrend } from '../lib/accountTrend'
import type { SavingsGoalRow } from '../types/database'

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

function Savings() {
  const { entries: income, loading: incomeLoading } = useIncome()
  const { entries: expenses, loading: expensesLoading } = useExpenses()
  const { accounts, loading: accountsLoading } = useAccounts()
  const { goals, loading: goalsLoading, error, addGoal, updateGoal, deleteGoal } = useSavingsGoals()

  const [formOpen, setFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoalRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteGoal, setConfirmDeleteGoal] = useState<SavingsGoalRow | null>(null)

  const chartLoading = incomeLoading || expensesLoading || accountsLoading
  const monthlyRate = monthlyIncomeTotal(income) - monthlyExpenseTotal(expenses)
  const currentYear = new Date().getFullYear()
  const { data: trendData, series: trendSeries } = buildAccountYearlyTrend(accounts, income, expenses)

  function openAddForm() {
    setEditingGoal(null)
    setFormOpen(true)
  }

  function openEditForm(goal: SavingsGoalRow) {
    setEditingGoal(goal)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingGoal(null)
  }

  async function handleSubmit(values: SavingsGoalInput) {
    const result = editingGoal ? await updateGoal(editingGoal.id, values) : await addGoal(values)
    if (!result.error) closeForm()
    return result
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteGoal(id)
    setDeletingId(null)
  }

  async function confirmDelete() {
    if (!confirmDeleteGoal) return
    await handleDelete(confirmDeleteGoal.id)
    setConfirmDeleteGoal(null)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-espresso">Savings</h1>
        <p className="mt-1 text-sm text-caramel">
          Each account&apos;s projected balance across {currentYear}, based on the income
          allocated to it and the expenses paid from it.
        </p>
      </div>

      <div className="rounded-2xl border border-latte bg-cream p-6">
        {chartLoading ? (
          <div className="h-72 animate-pulse rounded-xl bg-latte" />
        ) : accounts.length === 0 ? (
          <p className="text-caramel">
            No accounts yet —{' '}
            <Link to="/accounts" className="font-medium underline underline-offset-2">
              add one
            </Link>{' '}
            to see its balance trend here.
          </p>
        ) : (
          <SavingsTrendChart data={trendData} series={trendSeries} />
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-espresso">Savings Goals</h2>
          {!formOpen && (
            <button
              type="button"
              onClick={openAddForm}
              className="rounded-full bg-espresso px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-caramel"
            >
              Set a Savings Goal
            </button>
          )}
        </div>

        {formOpen && (
          <SavingsGoalForm
            defaultValues={
              editingGoal
                ? {
                    name: editingGoal.name,
                    target_amount: editingGoal.target_amount,
                    current_amount: editingGoal.current_amount,
                    target_date: editingGoal.target_date ?? '',
                  }
                : undefined
            }
            submitLabel={editingGoal ? 'Save changes' : 'Add goal'}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {goalsLoading ? (
          <p className="text-caramel">Loading goals…</p>
        ) : goals.length === 0 ? (
          <p className="text-caramel">No savings goals yet — set one above.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {goals.map((goal) => {
              const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100)
              const reachable = isGoalReachable(goal, monthlyRate)
              return (
                <li key={goal.id} className="rounded-xl border border-latte bg-cream px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-espresso">{goal.name}</p>
                      <p className="text-sm text-caramel">
                        {currencyFormatter.format(goal.current_amount)} of{' '}
                        {currencyFormatter.format(goal.target_amount)}
                        {goal.target_date &&
                          ` · by ${dateFormatter.format(new Date(goal.target_date))}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(goal)}
                        className="rounded-full border border-latte px-3 py-1.5 text-sm font-medium text-espresso transition-colors hover:bg-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteGoal(goal)}
                        disabled={deletingId === goal.id}
                        className="rounded-full border border-latte px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                      >
                        {deletingId === goal.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-espresso"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {!reachable && (
                    <p className="mt-2 text-sm text-red-600">
                      At your current savings rate, this goal isn&apos;t on track to be met in
                      time.{' '}
                      <Link to="/tips" className="font-medium underline underline-offset-2">
                        See tips to save more
                      </Link>
                      .
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirmDeleteGoal !== null}
        title="Delete this savings goal?"
        message={
          confirmDeleteGoal
            ? `"${confirmDeleteGoal.name}" will be permanently removed. This can't be undone.`
            : ''
        }
        loading={deletingId === confirmDeleteGoal?.id}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setConfirmDeleteGoal(null)}
      />
    </div>
  )
}

export default Savings
