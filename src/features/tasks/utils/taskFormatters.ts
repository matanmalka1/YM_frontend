import { formatDate } from '@/utils/utils'
import type { TaskStatus } from '../api/contracts'

export const formatTaskDueDate = (value: string | null | undefined): string => {
  if (!value) return 'ללא תאריך'
  return formatDate(value)
}

export const isTaskTerminal = (status: TaskStatus): boolean => status === 'done' || status === 'canceled'
