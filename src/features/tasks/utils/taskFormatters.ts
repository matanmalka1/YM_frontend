import type { TaskStatus } from '../api/contracts'

export const formatTaskDueDate = (value: string | null | undefined): string => {
  if (!value) return 'ללא תאריך'

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export const isTaskTerminal = (status: TaskStatus): boolean => status === 'done' || status === 'canceled'
