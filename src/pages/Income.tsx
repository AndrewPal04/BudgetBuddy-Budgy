import { useMemo, useState } from 'react'
import IncomeForm from '../components/IncomeForm'
import ConfirmDialog from '../components/ConfirmDialog'
import { useIncome, type IncomeEntry, type IncomeInput } from '../hooks/useIncome'
import { useAccounts } from '../hooks/useAccounts'
import type { IncomeRow } from '../types/database'
import { downloadCsv } from '../lib/csv'
import { sortByField, type SortOption } from '../lib/listSort'

const FREQUENCY_LABEL: Record<IncomeRow['frequency'], string> = {
  monthly: 'Monthly',
  biweekly: 'Bi-weekly',
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const SORT_OPTIONS: SortOption<IncomeRow>[] = [
  { value: 'created_desc', label: 'Date added (newest)', field: 'created_at', direction: 'desc' },
  { value: 'created_asc', label: 'Date added (oldest)', field: 'created_at', direction: 'asc' },
  { value: 'name_asc', label: 'Name (A–Z)', field: 'source_name', direction: 'asc' },
  { value: 'name_desc', label: 'Name (Z–A)', field: 'source_name', direction: 'desc' },
  { value: 'amount_desc', label: 'Amount (high–low)', field: 'amount', direction: 'desc' },
  { value: 'amount_asc', label: 'Amount (low–high)', field: 'amount', direction: 'asc' },
]

function Income() {
  const { entries, loading, error, addIncome, updateIncome, deleteIncome } = useIncome()
  const { accounts } = useAccounts()
  const accountNameById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name])),
    [accounts],
  )
  const [formOpen, setFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteEntry, setConfirmDeleteEntry] = useState<IncomeEntry | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortValue, setSortValue] = useState(SORT_OPTIONS[0].value)

  const visibleEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const filtered = query
      ? entries.filter((entry) => entry.source_name.toLowerCase().includes(query))
      : entries
    const sortOption = SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0]
    return sortByField(filtered, sortOption.field, sortOption.direction)
  }, [entries, searchQuery, sortValue])

  function openAddForm() {
    setEditingEntry(null)
    setFormOpen(true)
  }

  function openEditForm(entry: IncomeEntry) {
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

  async function confirmDelete() {
    if (!confirmDeleteEntry) return
    await handleDelete(confirmDeleteEntry.id)
    setConfirmDeleteEntry(null)
  }

  function handleExport() {
    downloadCsv(
      'budgy-income.csv',
      ['Source', 'Amount', 'Frequency', 'Date added', 'Accounts'],
      visibleEntries.map((entry) => [
        entry.source_name,
        entry.amount,
        FREQUENCY_LABEL[entry.frequency],
        entry.created_at.slice(0, 10),
        entry.allocations
          .map(
            (allocation) =>
              `${accountNameById.get(allocation.account_id) ?? 'Unknown account'}: ${currencyFormatter.format(allocation.amount)}`,
          )
          .join('; '),
      ]),
    )
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
                  allocations: editingEntry.allocations.map((allocation) => ({
                    account_id: allocation.account_id,
                    amount: allocation.amount,
                  })),
                }
              : undefined
          }
          submitLabel={editingEntry ? 'Save changes' : 'Add income'}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {entries.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by source…"
            className="min-w-[200px] flex-1 rounded-lg border border-latte bg-white px-3 py-2 text-sm text-espresso outline-none focus:border-caramel"
          />
          <select
            value={sortValue}
            onChange={(event) => setSortValue(event.target.value)}
            className="rounded-lg border border-latte bg-white px-3 py-2 text-sm text-espresso outline-none focus:border-caramel"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-full border border-latte px-4 py-2 text-sm font-medium text-espresso transition-colors hover:bg-latte"
          >
            Export CSV
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-caramel">Loading income…</p>
      ) : entries.length === 0 ? (
        <p className="text-caramel">No income yet — add your first source above.</p>
      ) : visibleEntries.length === 0 ? (
        <p className="text-caramel">No income sources match &quot;{searchQuery}&quot;.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visibleEntries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-xl border border-latte bg-cream px-4 py-3"
            >
              <div>
                <p className="font-medium text-espresso">{entry.source_name}</p>
                <p className="text-sm text-caramel">
                  {currencyFormatter.format(entry.amount)} · {FREQUENCY_LABEL[entry.frequency]}
                </p>
                {entry.allocations.length > 0 && (
                  <p className="mt-1 text-xs text-caramel">
                    →{' '}
                    {entry.allocations
                      .map(
                        (allocation) =>
                          `${accountNameById.get(allocation.account_id) ?? 'Unknown account'} (${currencyFormatter.format(allocation.amount)})`,
                      )
                      .join(', ')}
                  </p>
                )}
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
        title="Delete this income source?"
        message={
          confirmDeleteEntry
            ? `"${confirmDeleteEntry.source_name}" will be permanently removed. This can't be undone.`
            : ''
        }
        loading={deletingId === confirmDeleteEntry?.id}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setConfirmDeleteEntry(null)}
      />
    </div>
  )
}

export default Income
