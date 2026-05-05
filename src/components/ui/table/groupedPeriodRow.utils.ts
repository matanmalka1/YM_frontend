import { differenceInCalendarDays, format, isValid, parseISO } from 'date-fns'
import { he } from 'date-fns/locale'

export const formatPeriodDueDateLabel = (date: string | null | undefined): string | null => {
  if (!date) return null
  const parsed = parseISO(date)
  if (!isValid(parsed)) return null
  return `לתשלום עד ${format(parsed, 'dd/MM/yyyy', { locale: he })}`
}

export const formatRelativeDueLabel = (date: string | null | undefined): string | null => {
  if (!date) return null
  const parsed = parseISO(date)
  if (!isValid(parsed)) return null
  const days = differenceInCalendarDays(parsed, new Date())
  if (days < 0) return `באיחור ${Math.abs(days)} ימים`
  if (days === 0) return 'היום'
  if (days === 1) return 'מחר'
  return `בעוד ${days} ימים`
}

export const isCurrentReportingPeriod = (period: string | null | undefined, monthsCount = 1): boolean => {
  if (!period) return false

  const match = /^(\d{4})-(\d{2})$/.exec(period)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  if (month < 1 || month > 12) return false

  const safeMonthsCount = Math.max(Math.floor(monthsCount), 1)
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month - 1 + safeMonthsCount, 1)
  const now = new Date()
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  return currentMonth >= start && currentMonth < end
}
