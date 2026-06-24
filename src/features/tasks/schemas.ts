import { z } from 'zod'
import type { Task } from './api/contracts'
import { taskPriorityValues } from './constants/labels'
import { TASKS_ERROR_MESSAGES } from './errorMessages'

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, TASKS_ERROR_MESSAGES.form.titleRequired)
    .max(500, TASKS_ERROR_MESSAGES.form.titleTooLong),
  description: z.string(),
  priority: z.enum(taskPriorityValues),
  dueDate: z.string(),
  assignedToUserId: z.string(),
  assignedRole: z.enum(['advisor', 'secretary', '']),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>

export const getTaskFormDefaultValues = (task?: Task | null, sourceDueDate?: string | null): TaskFormValues => ({
  title: task?.title ?? '',
  description: task?.description ?? '',
  priority: task?.priority ?? 'normal',
  dueDate: (task?.due_date ?? sourceDueDate)?.slice(0, 10) ?? '',
  assignedToUserId: task?.assigned_to_user_id ? String(task.assigned_to_user_id) : '',
  assignedRole: task?.assigned_role ?? '',
})
