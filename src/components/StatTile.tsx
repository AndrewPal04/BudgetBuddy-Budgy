import { Link } from 'react-router-dom'

interface StatTileProps {
  label: string
  value: string
  subtitle: string
  to: string
  loading?: boolean
}

function StatTile({ label, value, subtitle, to, loading }: StatTileProps) {
  return (
    <Link
      to={to}
      className="flex flex-col gap-2 rounded-2xl border border-latte bg-cream p-8 transition-colors hover:bg-latte"
    >
      <span className="text-sm font-medium text-caramel">{label}</span>
      {loading ? (
        <span className="h-10 w-40 animate-pulse rounded-lg bg-latte" />
      ) : (
        <span className="text-4xl font-bold text-espresso">{value}</span>
      )}
      <span className="text-xs text-caramel">{subtitle}</span>
    </Link>
  )
}

export default StatTile
