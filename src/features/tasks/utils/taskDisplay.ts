import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import { makeVariantGetter } from '@/utils/labels'
import type { TaskPriority, TaskStatus } from '../api/contracts'

const taskStatusBadgeVariant: Record<TaskStatus, BadgeVariant> = {
  open: 'info',
  done: 'positive',
  canceled: 'neutral',
}
export const getTaskStatusBadgeVariant = makeVariantGetter(taskStatusBadgeVariant)

export const taskStatusDotClass: Record<TaskStatus, string> = {
  open: 'bg-primary-500',
  done: 'bg-positive-500',
  canceled: 'bg-gray-400',
}

export const taskPriorityBadgeVariants: Record<TaskPriority, BadgeVariant> = {
  low: 'neutral',
  normal: 'info',
  high: 'warning',
  urgent: 'negative',
}
