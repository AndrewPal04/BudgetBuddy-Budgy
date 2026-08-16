export type SortDirection = 'asc' | 'desc'

/** Sorts a copy of `items` by a given field, comparing numbers numerically and
 * everything else as strings. */
export function sortByField<T, K extends keyof T>(
  items: T[],
  field: K,
  direction: SortDirection,
): T[] {
  const sorted = [...items].sort((a, b) => {
    const av = a[field]
    const bv = b[field]
    const cmp =
      typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
    return direction === 'asc' ? cmp : -cmp
  })
  return sorted
}

export interface SortOption<T> {
  value: string
  label: string
  field: keyof T
  direction: SortDirection
}
