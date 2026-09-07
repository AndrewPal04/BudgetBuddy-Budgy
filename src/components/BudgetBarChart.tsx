import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BUDGET_WARNING_THRESHOLD } from '../lib/budgetMath'

const BROWN = '#6F4E37' // espresso — default bar color, well under limit
const WARNING_AMBER = '#F59E0B' // amber-500 — matches the budget limit list's warning color
const OVER_LIMIT_RED = '#DC2626' // red-600
const LIMIT_LINE_COLOR = '#3D2B1F'

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export interface BudgetBarItem {
  name: string
  spend: number
  limit: number
}

type BudgetStatus = 'under' | 'warning' | 'over'

/** Same threshold the budget limit list uses for its amber warning state, so a given
 * spend level reads the same color everywhere on the page. */
function budgetStatus(item: BudgetBarItem): BudgetStatus {
  if (item.limit <= 0) return 'under'
  const ratio = item.spend / item.limit
  if (ratio >= 1) return 'over'
  if (ratio >= BUDGET_WARNING_THRESHOLD) return 'warning'
  return 'under'
}

const BAR_COLOR: Record<BudgetStatus, string> = {
  under: BROWN,
  warning: WARNING_AMBER,
  over: OVER_LIMIT_RED,
}

const LINE_COLOR: Record<BudgetStatus, string> = {
  under: LIMIT_LINE_COLOR,
  warning: WARNING_AMBER,
  over: OVER_LIMIT_RED,
}

const STATUS_TEXT_CLASS: Record<BudgetStatus, string> = {
  under: 'text-espresso',
  warning: 'text-amber-700',
  over: 'text-red-600',
}

const STATUS_MESSAGE: Record<BudgetStatus, string | null> = {
  under: null,
  warning: 'Getting close to the limit',
  over: 'Limit reached',
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
  const status = budgetStatus(item)
  const message = STATUS_MESSAGE[status]

  return (
    <div className="rounded-lg border border-latte bg-white px-3 py-2 shadow-sm">
      <p className="text-sm font-semibold text-espresso">{item.name}</p>
      <p className={`text-sm ${STATUS_TEXT_CLASS[status]}`}>
        {currencyFormatter.format(item.spend)} of {currencyFormatter.format(item.limit)}
      </p>
      {message && <p className={`text-xs ${STATUS_TEXT_CLASS[status]}`}>{message}</p>}
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

  const status = budgetStatus(payload)
  const scale = payload.limit > 0 ? height / payload.limit : 0
  const spendHeight = Math.max(0, payload.spend * scale)
  const baseline = y + height
  const spendY = baseline - spendHeight

  return (
    <g>
      <rect x={x} y={spendY} width={width} height={spendHeight} fill={BAR_COLOR[status]} rx={3} />
      <line x1={x} y1={y} x2={x + width} y2={y} stroke={LINE_COLOR[status]} strokeWidth={2} />
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
