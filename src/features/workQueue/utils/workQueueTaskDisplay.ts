import { taskPriorityLabels, taskRoleLabels } from '@/features/tasks'
import type { WorkQueueItem } from '../api/contracts'

export const getWorkQueueMetadataValue = (item: WorkQueueItem, key: string): unknown =>
  item.metadata && typeof item.metadata === 'object' ? (item.metadata as Record<string, unknown>)[key] : undefined

export const getWorkQueueTaskPriority = (item: WorkQueueItem): string | null => {
  const priority =
    item.source_type === 'task'
      ? getWorkQueueMetadataValue(item, 'priority')
      : item.linked_tasks.length === 1
        ? item.linked_tasks[0].priority
        : null
  return typeof priority === 'string' ? priority : null
}

export const getWorkQueueTaskPriorityLabel = (item: WorkQueueItem): string | null => {
  const priority = getWorkQueueTaskPriority(item)
  return priority ? (taskPriorityLabels[priority] ?? priority) : null
}

export const getWorkQueueAssignedRoleLabel = (item: WorkQueueItem): string | null => {
  const role =
    item.source_type === 'task'
      ? getWorkQueueMetadataValue(item, 'assigned_role')
      : item.linked_tasks.length === 1
        ? item.linked_tasks[0].assigned_role
        : null
  return typeof role === 'string' && role ? (taskRoleLabels[role] ?? role) : null
}

export const getWorkQueueAssignedUserName = (item: WorkQueueItem): string | null => {
  const name =
    item.source_type === 'task'
      ? getWorkQueueMetadataValue(item, 'assigned_to_user_name')
      : item.linked_tasks.length === 1
        ? item.linked_tasks[0].assigned_user_name
        : null
  return typeof name === 'string' && name ? name : null
}
