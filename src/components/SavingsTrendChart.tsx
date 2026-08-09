import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SavingsProjectionPoint } from '../lib/savingsMath'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const LINE_COLOR = '#6F4E37' // espresso — single series, brand color, no legend needed

interface TrendTooltipPayloadEntry {
  value?: number
}

function TrendTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean
  label?: string
  payload?: TrendTooltipPayloadEntry[]
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-latte bg-white px-3 py-2 shadow-sm">
      <p className="text-sm font-semibold text-espresso">
        {currencyFormatter.format(payload[0].value ?? 0)}
      </p>
      <p className="text-xs text-caramel">{label}</p>
    </div>
  )
}

interface SavingsTrendChartProps {
  data: SavingsProjectionPoint[]
}

function SavingsTrendChart({ data }: SavingsTrendChartProps) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="#E1E0D9" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: '#898781' }}
            axisLine={{ stroke: '#C3C2B7' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#898781' }}
            axisLine={false}
            tickLine={false}
            width={64}
            tickFormatter={(value: number) => currencyFormatter.format(value)}
          />
          <Tooltip content={<TrendTooltip />} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke={LINE_COLOR}
            strokeWidth={2}
            dot={{ r: 4, fill: LINE_COLOR, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SavingsTrendChart
