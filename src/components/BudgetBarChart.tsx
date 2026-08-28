import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const BROWN = '#6F4E37' // espresso — default bar color
const OVER_LIMIT_RED = '#DC2626'
const LIMIT_LINE_COLOR = '#3D2B1F'

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export interface BudgetBarItem {
  name: string
  spend: number
  limit: number
}

function isOverLimit(item: BudgetBarItem) {
  return item.limit > 0 && item.spend >= item.limit
}

interface BudgetBarTooltipPayloadEntry {
  payload?: BudgetBarItem
}

function BudgetBarTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: BudgetBarTooltipPayloadEntry[]
}) {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0].payload
  if (!item) return null
  const overLimit = isOverLimit(item)

  return (
    <div className="rounded-lg border border-latte bg-white px-3 py-2 shadow-sm">
      <p className="text-sm font-semibold text-espresso">{item.name}</p>
      <p className={`text-sm ${overLimit ? 'text-red-600' : 'text-espresso'}`}>
        {currencyFormatter.format(item.spend)} of {currencyFormatter.format(item.limit)}
      </p>
      {overLimit && <p className="text-xs text-red-600">Limit reached</p>}
    </div>
  )
}

interface BudgetBarShapeProps {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: BudgetBarItem
}

// Bar's own dataKey is "limit", so Recharts already scales `y`/`height` correctly for the
// limit value — `y` is exactly the pixel height to draw the target line at. The spend bar
// is derived from that same scale (height / limit = pixels per dollar) since it shares this
// bar's rect rather than being a separate grouped/stacked series.
function BudgetBar(props: BudgetBarShapeProps) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props
  if (!payload) return null

  const overLimit = isOverLimit(payload)
  const scale = payload.limit > 0 ? height / payload.limit : 0
  const spendHeight = Math.max(0, payload.spend * scale)
  const baseline = y + height
  const spendY = baseline - spendHeight
  const color = overLimit ? OVER_LIMIT_RED : BROWN

  return (
    <g>
      <rect x={x} y={spendY} width={width} height={spendHeight} fill={color} rx={3} />
      <line
        x1={x}
        y1={y}
        x2={x + width}
        y2={y}
        stroke={overLimit ? OVER_LIMIT_RED : LIMIT_LINE_COLOR}
        strokeWidth={2}
      />
    </g>
  )
}

interface BudgetBarChartProps {
  title: string
  items: BudgetBarItem[]
  emptyMessage: string
}

function BudgetBarChart({ title, items, emptyMessage }: BudgetBarChartProps) {
  return (
    <div className="rounded-2xl border border-latte bg-cream p-6">
      <h2 className="text-lg font-bold text-espresso">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-6 text-sm text-caramel">{emptyMessage}</p>
      ) : (
        <div className="mt-2 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={items} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="#E1E0D9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#898781' }}
                axisLine={{ stroke: '#C3C2B7' }}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#898781' }}
                axisLine={false}
                tickLine={false}
                width={64}
                tickFormatter={(value: number) => currencyFormatter.format(value)}
              />
              <Tooltip content={<BudgetBarTooltip />} cursor={{ fill: 'rgba(111, 78, 55, 0.08)' }} />
              <Bar dataKey="limit" shape={BudgetBar} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default BudgetBarChart
