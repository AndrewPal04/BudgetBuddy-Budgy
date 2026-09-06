import { Link } from 'react-router-dom'
import type { AccountGrowth } from '../lib/accountGrowth'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  signDisplay: 'always',
})
const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })

interface SavingsGrowthCardProps {
  accounts: AccountGrowth[]
}

function SavingsGrowthCard({ accounts }: SavingsGrowthCardProps) {
  return (
    <div className="rounded-2xl border border-latte bg-cream p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-espresso">Savings Growth</h2>
        <Link
          to="/accounts"
          className="text-sm font-medium text-caramel underline-offset-2 hover:underline"
        >
          Manage accounts →
        </Link>
      </div>

      {accounts.length === 0 ? (
        <p className="mt-4 text-sm text-caramel">
          No savings accounts yet —{' '}
          <Link to="/accounts" className="font-medium underline underline-offset-2">
            add one
          </Link>{' '}
          to track its growth here.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {accounts.map((account) => (
            <li
              key={account.accountId}
              className="flex items-center justify-between rounded-xl border border-latte bg-white px-4 py-3"
            >
              <div>
                <p className="font-medium text-espresso">{account.name}</p>
                <p className="text-xs text-caramel">Since {dateFormatter.format(new Date(account.createdAt))}</p>
              </div>
              <p
                className={`text-sm font-semibold ${
                  account.increase >= 0 ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {currencyFormatter.format(account.increase)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-caramel">
        Based on income allocated to each account minus expenses paid from it — if you&apos;ve
        manually edited an account&apos;s balance, this number won&apos;t reflect that.
      </p>
    </div>
  )
}

export default SavingsGrowthCard
