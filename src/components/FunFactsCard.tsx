import type { FunFact } from '../lib/funFacts'

interface FunFactsCardProps {
  facts: FunFact[]
}

function FunFactsCard({ facts }: FunFactsCardProps) {
  return (
    <div className="rounded-2xl border border-latte bg-cream p-6">
      <h2 className="text-lg font-bold text-espresso">Fun Facts</h2>
      {facts.length === 0 ? (
        <p className="mt-4 text-sm text-caramel">
          Add some income, expenses, or accounts to see fun facts about your finances.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {facts.map((fact) => (
            <li
              key={fact.id}
              className="rounded-xl border border-latte bg-white px-4 py-3 text-sm text-espresso"
            >
              {fact.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default FunFactsCard
