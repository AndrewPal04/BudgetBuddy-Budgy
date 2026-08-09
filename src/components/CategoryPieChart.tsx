import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { buildPieSlices, CATEGORICAL_PALETTE, OTHER_SLICE_COLOR } from '../lib/chartPalette'

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

interface PieTooltipPayloadEntry {
  name?: string
  value?: number
}

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: PieTooltipPayloadEntry[]
}) {
  if (!active || !payload || payload.length === 0) return null
  const entry = payload[0]
  return (
    <div className="rounded-lg border border-latte bg-white px-3 py-2 shadow-sm">
      <p className="text-sm font-semibold text-espresso">
        {currencyFormatter.format(entry.value ?? 0)}
      </p>
      <p className="text-xs text-caramel">{entry.name}</p>
    </div>
  )
}

interface CategoryPieChartProps {
  title: string
  items: { name: string; value: number }[]
  emptyMessage: string
}

function CategoryPieChart({ title, items, emptyMessage }: CategoryPieChartProps) {
  const slices = buildPieSlices(items)
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)

  return (
    <div className="rounded-2xl border border-latte bg-cream p-6">
      <h2 className="text-lg font-bold text-espresso">{title}</h2>
      {slices.length === 0 || total <= 0 ? (
        <p className="mt-6 text-sm text-caramel">{emptyMessage}</p>
      ) : (
        <div className="mt-2 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                innerRadius="52%"
                outerRadius="80%"
                paddingAngle={2}
                stroke="none"
              >
                {slices.map((slice, index) => (
                  <Cell
                    key={slice.name}
                    fill={slice.isOther ? OTHER_SLICE_COLOR : CATEGORICAL_PALETTE[index]}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={48}
                wrapperStyle={{ fontSize: 12, color: '#52514E' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default CategoryPieChart
