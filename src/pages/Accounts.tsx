import { useState } from 'react'
import AccountForm from '../components/AccountForm'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAccounts, type AccountInput } from '../hooks/useAccounts'
import type { AccountRow, AccountType } from '../types/database'

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const GROUPS: { type: AccountType; title: string }[] = [
  { type: 'checking', title: 'Checking' },
  { type: 'savings', title: 'Savings' },
]

function Accounts() {
  const { accounts, loading, error, addAccount, updateAccount, deleteAccount } = useAccounts()

  const [formOpen, setFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<AccountRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState<AccountRow | null>(null)

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  function openAddForm() {
    setEditingAccount(null)
    setFormOpen(true)
  }

  function openEditForm(account: AccountRow) {
    setEditingAccount(account)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingAccount(null)
  }

  async function handleSubmit(values: AccountInput) {
    const result = editingAccount
      ? await updateAccount(editingAccount.id, values)
      : await addAccount(values)
    if (!result.error) closeForm()
    return result
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteAccount(id)
    setDeletingId(null)
  }

  async function confirmDelete() {
    if (!confirmDeleteAccount) return
    await handleDelete(confirmDeleteAccount.id)
    setConfirmDeleteAccount(null)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-espresso">Accounts</h1>
          <p className="mt-1 text-sm text-caramel">
            Track how much you have in each of your bank accounts.
          </p>
        </div>
        {!formOpen && (
          <button
            type="button"
            onClick={openAddForm}
            className="rounded-full bg-espresso px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-caramel"
          >
            Add Account
          </button>
        )}
      </div>

      {!loading && accounts.length > 0 && (
        <div className="rounded-2xl border border-latte bg-cream px-6 py-4">
          <p className="text-sm font-medium text-caramel">Total balance</p>
          <p className="text-2xl font-bold text-espresso">{currencyFormatter.format(totalBalance)}</p>
        </div>
      )}

      {formOpen && (
        <AccountForm
          defaultValues={
            editingAccount
              ? {
                  name: editingAccount.name,
                  type: editingAccount.type,
                  balance: editingAccount.balance,
                  interest_rate:
                    editingAccount.interest_rate != null ? String(editingAccount.interest_rate) : '',
                }
              : undefined
          }
          submitLabel={editingAccount ? 'Save changes' : 'Add account'}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-caramel">Loading accounts…</p>
      ) : accounts.length === 0 ? (
        <p className="text-caramel">No accounts yet — add one above.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {GROUPS.map((group) => {
            const groupAccounts = accounts.filter((account) => account.type === group.type)
            if (groupAccounts.length === 0) return null
            const groupTotal = groupAccounts.reduce((sum, account) => sum + account.balance, 0)

            return (
              <div key={group.type} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-espresso">{group.title}</h2>
                  <p className="text-sm font-medium text-caramel">
                    {currencyFormatter.format(groupTotal)}
                  </p>
                </div>

                <ul className="flex flex-col gap-4">
                  {groupAccounts.map((account) => (
                    <li
                      key={account.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-latte bg-cream px-4 py-4"
                    >
                      <div>
                        <p className="font-medium text-espresso">{account.name}</p>
                        <p className="text-sm text-caramel">
                          {currencyFormatter.format(account.balance)}
                          {account.interest_rate ? ` · ${account.interest_rate}% APR` : ''}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(account)}
                          className="rounded-full border border-latte px-3 py-1.5 text-sm font-medium text-espresso transition-colors hover:bg-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteAccount(account)}
                          disabled={deletingId === account.id}
                          className="rounded-full border border-latte px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                        >
                          {deletingId === account.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteAccount !== null}
        title="Delete this account?"
        message={
          confirmDeleteAccount
            ? `"${confirmDeleteAccount.name}" will be permanently removed. This can't be undone.`
            : ''
        }
        loading={deletingId === confirmDeleteAccount?.id}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setConfirmDeleteAccount(null)}
      />
    </div>
  )
}

export default Accounts
