import { Link } from 'react-router-dom'
import type { UpcomingBill } from '../lib/upcomingBills'

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const SOON_THRESHOLD_DAYS = 3

function relativeDayLabel(daysUntil: number): string {
  if (daysUntil <= 0) return 'Today'
  if (daysUntil === 1) return 'Tomorrow'
  return `In ${daysUntil} days`
}

interface UpcomingBillsProps {
  bills: UpcomingBill[]
}

function UpcomingBills({ bills }: UpcomingBillsProps) {
  return (
    <div className="rounded-2xl border border-latte bg-cream p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-espresso">Upcoming Bills</h2>
        <Link
          to="/expenses"
          className="text-sm font-medium text-caramel underline-offset-2 hover:underline"
        >
          Manage expenses →
        </Link>
      </div>

      {bills.length === 0 ? (
        <p className="mt-4 text-sm text-caramel">
          No upcoming bills tracked yet — add a billing date to your subscriptions to see them
          here.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {bills.map(({ expense, nextDate, daysUntil }) => (
            <li
              key={expense.id}
              className="flex items-center justify-between rounded-xl border border-latte bg-white px-4 py-3"
            >
              <div>
                <p className="font-medium text-espresso">{expense.name}</p>
                <p className="text-sm text-caramel">{currencyFormatter.format(expense.amount)}</p>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-medium ${
                    daysUntil <= SOON_THRESHOLD_DAYS ? 'text-amber-700' : 'text-espresso'
                  }`}
                >
                  {relativeDayLabel(daysUntil)}
                </p>
                <p className="text-xs text-caramel">{dateFormatter.format(nextDate)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default UpcomingBills
