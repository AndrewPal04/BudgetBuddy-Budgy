import StatTile from '../components/StatTile'
import CategoryPieChart from '../components/CategoryPieChart'
import { useIncome } from '../hooks/useIncome'
import { useExpenses } from '../hooks/useExpenses'
import { monthlyExpenseTotal, monthlyIncomeTotal, normalizeIncomeToMonthly } from '../lib/budgetMath'

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-latte bg-cream p-6">
      <div className="h-5 w-40 animate-pulse rounded bg-latte" />
      <div className="mx-auto mt-6 h-56 w-56 animate-pulse rounded-full bg-latte" />
    </div>
  )
}

function Home() {
  const { entries: income, loading: incomeLoading } = useIncome()
  const { entries: expenses, loading: expensesLoading } = useExpenses()

  const loading = incomeLoading || expensesLoading
  const monthlyIncome = monthlyIncomeTotal(income)
  const amountSpent = monthlyExpenseTotal(expenses)
  const amountSaved = monthlyIncome - amountSpent

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatTile
          label="Amount Spent"
          value={currencyFormatter.format(amountSpent)}
          subtitle="Monthly subscriptions + one-time expenses logged"
          to="/expenses"
          loading={loading}
        />
        <StatTile
          label="Amount Saved"
          value={currencyFormatter.format(amountSaved)}
          subtitle="Monthly income minus amount spent"
          to="/savings"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {loading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <CategoryPieChart
              title="Where your money is going"
              items={expenses.map((entry) => ({ name: entry.name, value: entry.amount }))}
              emptyMessage="No expenses yet — add one to see the breakdown."
            />
            <CategoryPieChart
              title="Income by source"
              items={income.map((entry) => ({
                name: entry.source_name,
                value: normalizeIncomeToMonthly(entry),
              }))}
              emptyMessage="No income yet — add a source to see the breakdown."
            />
          </>
        )}
      </div>
    </div>
  )
}

export default Home
