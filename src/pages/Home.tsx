import { Link } from 'react-router-dom'
import StatTile from '../components/StatTile'
import CategoryPieChart from '../components/CategoryPieChart'
import SavingsTrendChart from '../components/SavingsTrendChart'
import OnboardingChecklist from '../components/OnboardingChecklist'
import UpcomingBills from '../components/UpcomingBills'
import SavingsGrowthCard from '../components/SavingsGrowthCard'
import FunFactsCard from '../components/FunFactsCard'
import { useIncome } from '../hooks/useIncome'
import { useExpenses } from '../hooks/useExpenses'
import { useAccounts } from '../hooks/useAccounts'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { monthlyExpenseTotal, monthlyIncomeTotal, normalizeIncomeToMonthly } from '../lib/budgetMath'
import { buildAccountYearlyTrend } from '../lib/accountTrend'
import { buildAccountGrowth } from '../lib/accountGrowth'
import { buildFunFacts } from '../lib/funFacts'
import { buildUpcomingBills } from '../lib/upcomingBills'

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
  const { accounts, loading: accountsLoading } = useAccounts()
  const { goals, loading: goalsLoading } = useSavingsGoals()

  const loading = incomeLoading || expensesLoading
  const monthlyIncome = monthlyIncomeTotal(income)
  const amountSpent = monthlyExpenseTotal(expenses)
  const amountSaved = monthlyIncome - amountSpent

  const savingsLoading = loading || accountsLoading
  const { data: trendData, series: trendSeries } = buildAccountYearlyTrend(accounts, income, expenses)
  const upcomingBills = buildUpcomingBills(expenses)
  const savingsAccountGrowth = buildAccountGrowth(
    accounts.filter((account) => account.type === 'savings'),
    income,
    expenses,
  )
  const funFacts = buildFunFacts(accounts, income, expenses)

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-espresso">Overview</h1>

      {!loading && !goalsLoading && (
        <OnboardingChecklist
          hasIncome={income.length > 0}
          hasExpense={expenses.length > 0}
          hasGoal={goals.length > 0}
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatTile
          label="Amount Spent"
          value={currencyFormatter.format(amountSpent)}
          subtitle="Monthly recurring + one-time expenses logged"
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

      {savingsLoading ? (
        <div className="rounded-2xl border border-latte bg-cream p-6">
          <div className="h-5 w-40 animate-pulse rounded bg-latte" />
          <div className="mt-4 h-24 animate-pulse rounded-xl bg-latte" />
        </div>
      ) : (
        <FunFactsCard facts={funFacts} />
      )}

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

      {loading ? (
        <div className="rounded-2xl border border-latte bg-cream p-6">
          <div className="h-5 w-40 animate-pulse rounded bg-latte" />
          <div className="mt-4 h-24 animate-pulse rounded-xl bg-latte" />
        </div>
      ) : (
        <UpcomingBills bills={upcomingBills} />
      )}

      {savingsLoading ? (
        <div className="rounded-2xl border border-latte bg-cream p-6">
          <div className="h-5 w-40 animate-pulse rounded bg-latte" />
          <div className="mt-4 h-24 animate-pulse rounded-xl bg-latte" />
        </div>
      ) : (
        <SavingsGrowthCard accounts={savingsAccountGrowth} />
      )}

      <div className="rounded-2xl border border-latte bg-cream p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-espresso">Savings trend</h2>
          <Link
            to="/savings"
            className="text-sm font-medium text-caramel underline-offset-2 hover:underline"
          >
            View savings goals →
          </Link>
        </div>
        {savingsLoading ? (
          <div className="mt-4 h-72 animate-pulse rounded-xl bg-latte" />
        ) : accounts.length === 0 ? (
          <p className="mt-4 text-sm text-caramel">
            No accounts yet —{' '}
            <Link to="/accounts" className="font-medium underline underline-offset-2">
              add one
            </Link>{' '}
            to see its balance trend here.
          </p>
        ) : (
          <div className="mt-2">
            <SavingsTrendChart data={trendData} series={trendSeries} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
