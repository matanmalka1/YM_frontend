import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import { makeVariantGetter } from '@/utils/labels'
import type { TaskPriority, TaskStatus } from '../api/contracts'

const taskStatusBadgeVariant: Record<TaskStatus, BadgeVariant> = {
  open: 'info',
  done: 'success',
  canceled: 'neutral',
}
export const getTaskStatusBadgeVariant = makeVariantGetter(taskStatusBadgeVariant)

export const taskStatusDotClass: Record<TaskStatus, string> = {
  open: 'bg-primary-500',
  done: 'bg-positive-500',
  canceled: 'bg-gray-400',
}

export const taskPriorityBadgeClasses: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-primary-50 text-primary-700',
  high: 'bg-warning-50 text-warning-700',
  urgent: 'bg-negative-50 text-negative-700',
}

export const taskPriorityRailClasses: Record<TaskPriority, string> = {
  low: 'bg-gray-300',
  normal: 'bg-primary-400',
  high: 'bg-warning-400',
  urgent: 'bg-negative-500',
}
