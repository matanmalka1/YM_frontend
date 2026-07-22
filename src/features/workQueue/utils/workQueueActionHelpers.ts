import type { TaskSourceContext } from '@/features/tasks'
import type { WorkQueueAction, WorkQueueItem, WorkQueueListResponse, WorkQueueSourceType } from '../api/contracts'

export type TaskActionKeyBase = 'cancel_task' | 'complete_task' | 'continue_task' | 'delete_task' | 'edit_task'

export type WorkQueueListSnapshot = Array<[readonly unknown[], WorkQueueListResponse | undefined]>

export const getWorkQueueActionKey = (item: WorkQueueItem, action: WorkQueueAction) => `${item.id}:${action.key}`

export const isTaskActionKey = (key: string, base: TaskActionKeyBase) => {
  if (key === base) return true
  const suffixPrefix = `${base}_`
  return key.startsWith(suffixPrefix) && /^\d+$/.test(key.slice(suffixPrefix.length))
}

export const getTaskSourceContext = (item: WorkQueueItem): TaskSourceContext => ({
  source_domain: item.source_type,
  source_id: item.source_id,
  title: item.title,
  client_name: item.client_name,
  due_date: item.due_date,
  linked_tasks_count: item.linked_tasks_count,
  linked_tasks: item.linked_tasks,
})

export const getLinkedTaskSourceContext = (item: WorkQueueItem): TaskSourceContext | null => {
  if (item.source_type !== 'task' || !item.source_summary) return null
  return {
    source_domain: item.source_summary.source_type as WorkQueueSourceType,
    source_id: item.source_summary.source_id,
    title: item.source_summary.label,
    client_name: item.client_name,
    due_date: item.due_date,
  }
}

export const optimisticallyRemoveTask = (data: WorkQueueListResponse | undefined, taskId: number) => {
  if (!data) return data
  let changed = false
  let removedStandaloneRow = false
  const items = data.items
    .map((item) => {
      if (item.source_type === 'task' && item.source_id === taskId) {
        changed = true
        removedStandaloneRow = true
        return null
      }
      const linkedTasks = item.linked_tasks.filter((task) => task.id !== taskId)
      if (linkedTasks.length === item.linked_tasks.length) return item
      changed = true
      return { ...item, linked_tasks: linkedTasks, linked_tasks_count: linkedTasks.length }
    })
    .filter((item): item is WorkQueueItem => item !== null)
  if (!changed) return data
  return {
    ...data,
    items,
    total: removedStandaloneRow ? Math.max(0, data.total - 1) : data.total,
  }
}
