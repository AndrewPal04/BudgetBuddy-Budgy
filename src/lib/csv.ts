type CsvCell = string | number | null | undefined

function escapeCell(value: CsvCell): string {
  const str = value === null || value === undefined ? '' : String(value)
  if (/["\n,]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/** Builds a CSV file from headers + rows and triggers a browser download. */
export function downloadCsv(filename: string, headers: string[], rows: CsvCell[][]): void {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(','))
  const csvContent = lines.join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
