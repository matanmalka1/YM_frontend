export const parseReportYear = (value: string, fallback = new Date().getFullYear()): number => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 2000 && parsed <= 2100 ? parsed : fallback
}

export const parseReportMonth = (value: string): number | undefined => {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 12 ? parsed : undefined
}

export const parseReportDate = (value: string, fallback: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback
  const parsed = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value ? fallback : value
}
