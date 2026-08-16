// Fixed-order categorical palette for pie/chart series. Warm/earthy hues chosen to sit
// alongside the espresso/caramel brand, but spread across distinct hue families (not
// shades of one color) so the set stays CVD-distinguishable — validated with the
// dataviz skill's validate_palette.js against the cream (#FFFAF5) card surface:
// all checks pass except a contrast WARN on the gold slot, which requires a visible
// legend/labels as relief (this palette is only ever used with a legend + tooltip).
export const CATEGORICAL_PALETTE = [
  '#2E5FA3', // blue
  '#C1602E', // terracotta
  '#0A8A73', // teal
  '#C99A2E', // gold
  '#B5657A', // dusty rose
  '#5C7A29', // olive
  '#6B4A8A', // plum
  '#A6402A', // brick red
] as const

// Neutral, deliberately outside the categorical set so it never impersonates a series.
export const OTHER_SLICE_COLOR = '#A8A6A0'

export interface PieInputItem {
  name: string
  value: number
  /** Optional extra line shown in the tooltip (e.g. "$120 spent (60%)"). */
  detail?: string
}

export interface PieSlice extends PieInputItem {
  isOther?: boolean
}

const MAX_SLICES = CATEGORICAL_PALETTE.length - 1

/** Groups by name, sorts descending, and folds anything past the token ceiling into "Other". */
export function buildPieSlices(items: PieInputItem[]): PieSlice[] {
  const grouped = new Map<string, { value: number; detail?: string }>()
  for (const item of items) {
    if (item.value <= 0) continue
    const existing = grouped.get(item.name)
    grouped.set(item.name, {
      value: (existing?.value ?? 0) + item.value,
      detail: item.detail ?? existing?.detail,
    })
  }

  const sorted = Array.from(grouped, ([name, entry]) => ({
    name,
    value: entry.value,
    detail: entry.detail,
  })).sort((a, b) => b.value - a.value)

  if (sorted.length <= MAX_SLICES) return sorted

  const head = sorted.slice(0, MAX_SLICES)
  const tailTotal = sorted.slice(MAX_SLICES).reduce((sum, slice) => sum + slice.value, 0)
  return [...head, { name: 'Other', value: tailTotal, isOther: true }]
}
