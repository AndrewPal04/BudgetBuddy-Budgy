import { useIncome } from '../hooks/useIncome'
import { useExpenses } from '../hooks/useExpenses'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useTips } from '../hooks/useTips'
import { monthlyExpenseTotal, monthlyIncomeTotal } from '../lib/budgetMath'
import { isGoalReachable } from '../lib/savingsMath'
import { buildPercentStats } from '../lib/tipStats'

function Tips() {
  const { entries: income, loading: incomeLoading } = useIncome()
  const { entries: expenses, loading: expensesLoading } = useExpenses()
  const { goals, loading: goalsLoading } = useSavingsGoals()
  const { tips, loading: tipsLoading, error, generate } = useTips()

  const dataLoading = incomeLoading || expensesLoading || goalsLoading
  const monthlyIncome = monthlyIncomeTotal(income)
  const monthlyExpenses = monthlyExpenseTotal(expenses)
  const monthlyRate = monthlyIncome - monthlyExpenses
  const percentStats = buildPercentStats(income, expenses)

  function handleGenerate() {
    const topExpenses = [...expenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((entry) => ({ name: entry.name, amount: entry.amount }))

    const goalsPayload = goals.map((goal) => ({
      name: goal.name,
      targetAmount: goal.target_amount,
      currentAmount: goal.current_amount,
      targetDate: goal.target_date,
      onTrack: isGoalReachable(goal, monthlyRate),
    }))

    void generate({ monthlyIncome, monthlyExpenses, topExpenses, goals: goalsPayload })
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-espresso">Tips</h1>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-espresso">Quick stats</h2>
        {dataLoading ? (
          <p className="text-caramel">Loading your numbers…</p>
        ) : percentStats.length === 0 ? (
          <p className="text-caramel">
            Add your income and expenses to see personalized stats here.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {percentStats.map((stat) => (
              <li key={stat.label} className="rounded-xl border border-latte bg-cream px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-caramel">
                  {stat.label}
                </p>
                <p className="mt-1 text-sm text-espresso">{stat.value}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-espresso">AI Tips</h2>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={dataLoading || tipsLoading}
            className="rounded-full bg-espresso px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-caramel disabled:opacity-60"
          >
            {tipsLoading ? 'Thinking…' : tips.length > 0 ? 'Regenerate' : 'Get AI Tips'}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {error} The quick stats above are still available in the meantime.
          </p>
        )}

        {!error && tips.length === 0 && !tipsLoading && (
          <p className="text-caramel">
            Get 3–5 short, personalized tips based on your income, expenses, and goals.
          </p>
        )}

        {tips.length > 0 && (
          <ul className="flex flex-col gap-3">
            {tips.map((tip, index) => (
              <li
                key={index}
                className="rounded-xl border border-latte bg-cream px-4 py-3 text-sm text-espresso"
              >
                {tip}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Tips
