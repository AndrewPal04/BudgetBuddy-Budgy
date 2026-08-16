import { useState } from 'react'
import ExpenseForm from '../components/ExpenseForm'
import ConfirmDialog from '../components/ConfirmDialog'
import { useExpenses, type ExpenseInput } from '../hooks/useExpenses'
import type { ExpenseRow } from '../types/database'

const BILLING_CYCLE_LABEL: Record<'monthly' | 'yearly', string> = {
  monthly: 'Monthly',
  yearly: 'Yearly',
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function Expenses() {
  const { entries, loading, error, addExpense, updateExpense, deleteExpense } = useExpenses()
  const [formOpen, setFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<ExpenseRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteEntry, setConfirmDeleteEntry] = useState<ExpenseRow | null>(null)

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

  return (
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
  )
}

export default Expenses
