import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CATEGORICAL_PALETTE } from '../lib/chartPalette'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const SINGLE_SERIES_COLOR = '#6F4E37' // espresso — used only when there's one line and no key

export interface TrendSeries {
  key: string
  name: string
}

const DEFAULT_SERIES: TrendSeries[] = [{ key: 'amount', name: 'Savings' }]

function colorForSeries(index: number, count: number): string {
  return count <= 1 ? SINGLE_SERIES_COLOR : CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length]
}

interface TrendTooltipPayloadEntry {
  dataKey?: string
  name?: string
  value?: number
  color?: string
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
      <p className="text-xs text-caramel">{label}</p>
      <div className="mt-1 flex flex-col gap-0.5">
        {payload.map((entry) => (
          <p key={entry.dataKey} className="flex items-center gap-1.5 text-sm font-semibold text-espresso">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {payload.length > 1 && <span className="font-normal text-caramel">{entry.name}:</span>}
            {currencyFormatter.format(entry.value ?? 0)}
          </p>
        ))}
      </div>
    </div>
  )
}

interface SavingsTrendChartProps {
  data: Array<Record<string, number | string>>
  /** Defaults to a single unlabeled "Savings" line with no legend (the Home page glance). */
  series?: TrendSeries[]
}

function SavingsTrendChart({ data, series = DEFAULT_SERIES }: SavingsTrendChartProps) {
  const showLegend = series.length > 1

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
          {showLegend && (
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12, color: '#52514E' }} />
          )}
          {series.map((entry, index) => {
            const color = colorForSeries(index, series.length)
            return (
              <Line
                key={entry.key}
                type="monotone"
                dataKey={entry.key}
                name={entry.name}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SavingsTrendChart
