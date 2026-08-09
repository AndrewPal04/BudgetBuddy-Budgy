import { useState } from 'react'
import IncomeForm from '../components/IncomeForm'
import { useIncome, type IncomeInput } from '../hooks/useIncome'
import type { IncomeRow } from '../types/database'

const FREQUENCY_LABEL: Record<IncomeRow['frequency'], string> = {
  monthly: 'Monthly',
  biweekly: 'Bi-weekly',
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function Income() {
  const { entries, loading, error, addIncome, updateIncome, deleteIncome } = useIncome()
  const [formOpen, setFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<IncomeRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function openAddForm() {
    setEditingEntry(null)
    setFormOpen(true)
  }

  function openEditForm(entry: IncomeRow) {
    setEditingEntry(entry)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingEntry(null)
  }

  async function handleSubmit(values: IncomeInput) {
    const result = editingEntry
      ? await updateIncome(editingEntry.id, values)
      : await addIncome(values)
    if (!result.error) closeForm()
    return result
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteIncome(id)
    setDeletingId(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-espresso">Income</h1>
        {!formOpen && (
          <button
            type="button"
            onClick={openAddForm}
            className="rounded-full bg-espresso px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-caramel"
          >
            Add Income
          </button>
        )}
      </div>

      {formOpen && (
        <IncomeForm
          defaultValues={
            editingEntry
              ? {
                  source_name: editingEntry.source_name,
                  amount: editingEntry.amount,
                  frequency: editingEntry.frequency,
                }
              : undefined
          }
          submitLabel={editingEntry ? 'Save changes' : 'Add income'}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-caramel">Loading income…</p>
      ) : entries.length === 0 ? (
        <p className="text-caramel">No income yet — add your first source above.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-xl border border-latte bg-cream px-4 py-3"
            >
              <div>
                <p className="font-medium text-espresso">{entry.source_name}</p>
                <p className="text-sm text-caramel">
                  {currencyFormatter.format(entry.amount)} · {FREQUENCY_LABEL[entry.frequency]}
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
                  onClick={() => void handleDelete(entry.id)}
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
    </div>
  )
}

export default Income
