import { differenceInCalendarDays, isValid, parseISO } from 'date-fns'
import { formatDate } from '@/utils/utils'

export const formatDueDateLabel = (date: string | null | undefined, prefix = 'לתשלום עד'): string | null => {
  if (!date) return null
  const parsed = parseISO(date)
  if (!isValid(parsed)) return null
  return `${prefix} ${formatDate(date)}`
}

export const formatRelativeDueLabel = (
  date: string | null | undefined,
  options: { showPastDue?: boolean } = {},
): string | null => {
  if (!date) return null
  const parsed = parseISO(date)
  if (!isValid(parsed)) return null
  const days = differenceInCalendarDays(parsed, new Date())
  if (days < 0) return options.showPastDue === false ? null : `באיחור ${Math.abs(days)} ימים`
  if (days === 0) return 'היום'
  if (days === 1) return 'מחר'
  return `בעוד ${days} ימים`
}
