import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { buildPieSlices, CATEGORICAL_PALETTE, OTHER_SLICE_COLOR } from '../lib/chartPalette'

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

// Below this share of the whole, a slice's arc is too thin to hold text — the
// percentage moves outside with a leader line instead.
const MIN_INSIDE_LABEL_PERCENT = 0.08
const RADIAN = Math.PI / 180

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

/** WCAG-style relative luminance — picks readable text (white or ink) for a fill color. */
function contrastTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const linear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const luminance = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
  return luminance > 0.45 ? '#0B0B0B' : '#FFFFFF'
}

interface PieLabelProps {
  cx?: number
  cy?: number
  midAngle?: number
  innerRadius?: number
  outerRadius?: number
  percent?: number
  index?: number
}

interface CategoryPieChartProps {
  title: string
  items: { name: string; value: number }[]
  emptyMessage: string
}

function CategoryPieChart({ title, items, emptyMessage }: CategoryPieChartProps) {
  const slices = buildPieSlices(items)
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)

  function colorForIndex(index: number): string {
    const slice = slices[index]
    return slice?.isOther ? OTHER_SLICE_COLOR : CATEGORICAL_PALETTE[index]
  }

  function renderPercentLabel(props: PieLabelProps) {
    const {
      cx = 0,
      cy = 0,
      midAngle = 0,
      innerRadius = 0,
      outerRadius = 0,
      percent = 0,
      index = 0,
    } = props
    const label = `${Math.round(percent * 100)}%`
    const angleRad = -midAngle * RADIAN
    const fill = colorForIndex(index)

    if (percent >= MIN_INSIDE_LABEL_PERCENT) {
      const radius = innerRadius + (outerRadius - innerRadius) * 0.6
      const x = cx + radius * Math.cos(angleRad)
      const y = cy + radius * Math.sin(angleRad)
      return (
        <text
          x={x}
          y={y}
          fill={contrastTextColor(fill)}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight={600}
        >
          {label}
        </text>
      )
    }

    // Slice too thin for an inline label — leader line out to the margin instead.
    const lineStart = outerRadius + 2
    const lineEnd = outerRadius + 14
    const startX = cx + lineStart * Math.cos(angleRad)
    const startY = cy + lineStart * Math.sin(angleRad)
    const endX = cx + lineEnd * Math.cos(angleRad)
    const endY = cy + lineEnd * Math.sin(angleRad)
    const textAnchor = Math.cos(angleRad) >= 0 ? 'start' : 'end'
    const textX = endX + (textAnchor === 'start' ? 4 : -4)

    return (
      <g>
        <path
          d={`M${startX},${startY} L${endX},${endY}`}
          stroke="#C3C2B7"
          strokeWidth={1}
          fill="none"
        />
        <text
          x={textX}
          y={endY}
          fill="#52514E"
          textAnchor={textAnchor}
          dominantBaseline="central"
          fontSize={11}
        >
          {label}
        </text>
      </g>
    )
  }

  return (
    <div className="rounded-2xl border border-latte bg-cream p-6">
      <h2 className="text-lg font-bold text-espresso">{title}</h2>
      {slices.length === 0 || total <= 0 ? (
        <p className="mt-6 text-sm text-caramel">{emptyMessage}</p>
      ) : (
        <div className="mt-2 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 16, right: 32, bottom: 0, left: 32 }}>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                innerRadius="52%"
                outerRadius="68%"
                paddingAngle={2}
                stroke="none"
                label={renderPercentLabel}
                labelLine={false}
                isAnimationActive={false}
              >
                {slices.map((slice, index) => (
                  <Cell key={slice.name} fill={colorForIndex(index)} />
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
