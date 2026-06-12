import { differenceInCalendarDays, format, isValid, parseISO } from 'date-fns'
import { he } from 'date-fns/locale'

export const formatDueDateLabel = (date: string | null | undefined, prefix = 'לתשלום עד'): string | null => {
  if (!date) return null
  const parsed = parseISO(date)
  if (!isValid(parsed)) return null
  return `${prefix} ${format(parsed, 'dd/MM/yyyy', { locale: he })}`
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
