import { useState } from 'react'
import ExpenseForm from '../components/ExpenseForm'
import BudgetLimitForm from '../components/BudgetLimitForm'
import CategoryPieChart from '../components/CategoryPieChart'
import ConfirmDialog from '../components/ConfirmDialog'
import { useExpenses, type ExpenseInput } from '../hooks/useExpenses'
import { useBudgetLimits } from '../hooks/useBudgetLimits'
import type { BudgetLimitRow, ExpenseRow } from '../types/database'
import { CATEGORY_LABELS } from '../lib/expenseCategories'
import { monthlyCategorySpend } from '../lib/budgetMath'

const BILLING_CYCLE_LABEL: Record<'monthly' | 'yearly', string> = {
  monthly: 'Monthly',
  yearly: 'Yearly',
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const WARNING_THRESHOLD = 0.8

function Expenses() {
  const { entries, loading, error, addExpense, updateExpense, deleteExpense } = useExpenses()
  const [formOpen, setFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<ExpenseRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteEntry, setConfirmDeleteEntry] = useState<ExpenseRow | null>(null)

  const {
    limits,
    loading: limitsLoading,
    error: limitsError,
    setLimit,
    deleteLimit,
  } = useBudgetLimits()
  const [limitFormOpen, setLimitFormOpen] = useState(false)
  const [editingLimit, setEditingLimit] = useState<BudgetLimitRow | null>(null)
  const [deletingLimitId, setDeletingLimitId] = useState<string | null>(null)
  const [confirmDeleteLimit, setConfirmDeleteLimit] = useState<BudgetLimitRow | null>(null)

  function openAddForm() {
    setEditingEntry(null)
    setFormOpen(true)
  }

  function openEditForm(entry: ExpenseRow) {
    setEditingEntry(entry)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingEntry(null)
  }

  async function handleSubmit(values: ExpenseInput) {
    const result = editingEntry
      ? await updateExpense(editingEntry.id, values)
      : await addExpense(values)
    if (!result.error) closeForm()
    return result
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteExpense(id)
    setDeletingId(null)
  }

  async function confirmDelete() {
    if (!confirmDeleteEntry) return
    await handleDelete(confirmDeleteEntry.id)
    setConfirmDeleteEntry(null)
  }

  function openAddLimitForm() {
    setEditingLimit(null)
    setLimitFormOpen(true)
  }

  function openEditLimitForm(limit: BudgetLimitRow) {
    setEditingLimit(limit)
    setLimitFormOpen(true)
  }

  function closeLimitForm() {
    setLimitFormOpen(false)
    setEditingLimit(null)
  }

  async function handleLimitSubmit(values: { category: BudgetLimitRow['category']; monthly_limit: number }) {
    const result = await setLimit(values.category, values.monthly_limit)
    if (!result.error) closeLimitForm()
    return result
  }

  async function handleDeleteLimit(id: string) {
    setDeletingLimitId(id)
    await deleteLimit(id)
    setDeletingLimitId(null)
  }

  async function confirmDeleteLimitAction() {
    if (!confirmDeleteLimit) return
    await handleDeleteLimit(confirmDeleteLimit.id)
    setConfirmDeleteLimit(null)
  }

  const budgetPieItems = limits.map((limit) => {
    const spend = monthlyCategorySpend(entries, limit.category)
    const percentUsed = limit.monthly_limit > 0 ? Math.round((spend / limit.monthly_limit) * 100) : 0
    return {
      name: CATEGORY_LABELS[limit.category],
      value: limit.monthly_limit,
      detail: `${currencyFormatter.format(spend)} spent (${percentUsed}%)`,
    }
  })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-espresso">Expenses</h1>
          {!formOpen && (
            <button
              type="button"
              onClick={openAddForm}
              className="rounded-full bg-espresso px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-caramel"
            >
              Add Expense
            </button>
          )}
        </div>

        {formOpen && (
          <ExpenseForm
            defaultValues={
              editingEntry
                ? {
                    name: editingEntry.name,
                    amount: editingEntry.amount,
                    type: editingEntry.type,
                    billing_cycle: editingEntry.billing_cycle ?? undefined,
                    billing_date: editingEntry.billing_date ?? undefined,
                    category: editingEntry.category,
                  }
                : undefined
            }
            submitLabel={editingEntry ? 'Save changes' : 'Add expense'}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-caramel">Loading expenses…</p>
        ) : entries.length === 0 ? (
          <p className="text-caramel">No expenses yet — add your first one above.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between rounded-xl border border-latte bg-cream px-4 py-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-espresso">{entry.name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        entry.type === 'subscription'
                          ? 'bg-espresso text-white'
                          : 'border border-latte text-caramel'
                      }`}
                    >
                      {entry.type === 'subscription' ? 'Subscription' : 'One-time'}
                    </span>
                    <span className="rounded-full border border-latte px-2 py-0.5 text-xs font-medium text-caramel">
                      {CATEGORY_LABELS[entry.category]}
                    </span>
                  </div>
                  <p className="text-sm text-caramel">
                    {currencyFormatter.format(entry.amount)}
                    {entry.type === 'subscription' && entry.billing_cycle
                      ? ` · ${BILLING_CYCLE_LABEL[entry.billing_cycle]}`
                      : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditForm(entry)}
                    className="rounded-full border border-latte px-3 py-1.5 text-sm font-medium text-espresso transition-colors hover:bg-latte"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteEntry(entry)}
                    disabled={deletingId === entry.id}
                    className="rounded-full border border-latte px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                  >
                    {deletingId === entry.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <ConfirmDialog
          open={confirmDeleteEntry !== null}
          title="Delete this expense?"
          message={
            confirmDeleteEntry
              ? `"${confirmDeleteEntry.name}" will be permanently removed. This can't be undone.`
              : ''
          }
          loading={deletingId === confirmDeleteEntry?.id}
          onConfirm={() => void confirmDelete()}
          onCancel={() => setConfirmDeleteEntry(null)}
        />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-espresso">Budget Limits</h2>
          {!limitFormOpen && (
            <button
              type="button"
              onClick={openAddLimitForm}
              className="rounded-full bg-espresso px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-caramel"
            >
              Set a Budget Limit
            </button>
          )}
        </div>

        {limitsLoading || loading ? (
          <div className="rounded-2xl border border-latte bg-cream p-6">
            <div className="h-5 w-40 animate-pulse rounded bg-latte" />
            <div className="mx-auto mt-6 h-48 w-48 animate-pulse rounded-full bg-latte" />
          </div>
        ) : (
          <CategoryPieChart
            title="Budget by Category"
            items={budgetPieItems}
            emptyMessage="Set a budget limit above to see how your budget is split across categories."
          />
        )}

        {limitFormOpen && (
          <BudgetLimitForm
            defaultValues={
              editingLimit
                ? { category: editingLimit.category, monthly_limit: editingLimit.monthly_limit }
                : undefined
            }
            lockCategory={Boolean(editingLimit)}
            submitLabel={editingLimit ? 'Save changes' : 'Set limit'}
            onSubmit={handleLimitSubmit}
            onCancel={closeLimitForm}
          />
        )}

        {limitsError && <p className="text-sm text-red-600">{limitsError}</p>}

        {limitsLoading ? (
          <p className="text-caramel">Loading budget limits…</p>
        ) : limits.length === 0 ? (
          <p className="text-caramel">
            No budget limits yet — cap a category above to track it here.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {limits.map((limit) => {
              const spend = monthlyCategorySpend(entries, limit.category)
              const ratio = limit.monthly_limit > 0 ? spend / limit.monthly_limit : 0
              const progress = Math.min(100, ratio * 100)
              const barColor =
                ratio > 1 ? 'bg-red-600' : ratio >= WARNING_THRESHOLD ? 'bg-amber-500' : 'bg-espresso'

              return (
                <li key={limit.id} className="rounded-xl border border-latte bg-cream px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-espresso">{CATEGORY_LABELS[limit.category]}</p>
                      <p className="text-sm text-caramel">
                        {currencyFormatter.format(spend)} of{' '}
                        {currencyFormatter.format(limit.monthly_limit)} this month
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => openEditLimitForm(limit)}
                        className="rounded-full border border-latte px-3 py-1.5 text-sm font-medium text-espresso transition-colors hover:bg-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteLimit(limit)}
                        disabled={deletingLimitId === limit.id}
                        className="rounded-full border border-latte px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                      >
                        {deletingLimitId === limit.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {ratio > 1 ? (
                    <p className="mt-2 text-sm text-red-600">
                      Over budget by {currencyFormatter.format(spend - limit.monthly_limit)} this
                      month.
                    </p>
                  ) : ratio >= WARNING_THRESHOLD ? (
                    <p className="mt-2 text-sm text-amber-700">
                      Getting close — {Math.round(progress)}% of this category&apos;s budget used.
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}

        <ConfirmDialog
          open={confirmDeleteLimit !== null}
          title="Delete this budget limit?"
          message={
            confirmDeleteLimit
              ? `The limit for "${CATEGORY_LABELS[confirmDeleteLimit.category]}" will be removed. This can't be undone.`
              : ''
          }
          loading={deletingLimitId === confirmDeleteLimit?.id}
          onConfirm={() => void confirmDeleteLimitAction()}
          onCancel={() => setConfirmDeleteLimit(null)}
        />
      </div>
    </div>
  )
}

export default Expenses
