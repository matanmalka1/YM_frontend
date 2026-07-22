import { Link } from 'react-router-dom'
import { DefinitionList } from '@/components/ui/layout'
import { formatDateTime } from '@/utils/utils'
import type { Task } from '../../api/contracts'
import { taskRoleLabels, taskStatusLabels } from '../../constants/labels'
import { TASKS_MESSAGES } from '../../messages'

interface TaskHistoryDetailsProps {
  task: Task
}

export const TaskHistoryDetails: React.FC<TaskHistoryDetailsProps> = ({ task }) => {
  const client = task.client_record_id ? (
    <Link to={`/clients/${task.client_record_id}/tasks`} className="text-primary-600 hover:underline">
      {task.client_name ?? `#${task.client_record_id}`}
      {task.office_client_number != null ? ` · ${task.office_client_number}` : ''}
    </Link>
  ) : null
  const source = task.source_domain && task.source_id ? `${task.source_domain} #${task.source_id}` : null

  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">{TASKS_MESSAGES.details.title}</h3>
      <DefinitionList
        columns={2}
        items={[
          { label: TASKS_MESSAGES.details.status, value: taskStatusLabels[task.status] },
          { label: TASKS_MESSAGES.details.client, value: client },
          { label: TASKS_MESSAGES.details.assignee, value: task.assigned_to_user_name },
          {
            label: TASKS_MESSAGES.details.role,
            value: task.assigned_role ? (taskRoleLabels[task.assigned_role] ?? task.assigned_role) : null,
          },
          { label: TASKS_MESSAGES.details.source, value: source },
          { label: TASKS_MESSAGES.details.createdBy, value: task.created_by_user_name },
          { label: TASKS_MESSAGES.details.createdAt, value: formatDateTime(task.created_at) },
          { label: TASKS_MESSAGES.details.updatedAt, value: formatDateTime(task.updated_at) },
          { label: TASKS_MESSAGES.details.completedBy, value: task.completed_by_user_name },
          { label: TASKS_MESSAGES.details.completedAt, value: task.completed_at ? formatDateTime(task.completed_at) : null },
          { label: TASKS_MESSAGES.details.canceledBy, value: task.canceled_by_user_name },
          { label: TASKS_MESSAGES.details.canceledAt, value: task.canceled_at ? formatDateTime(task.canceled_at) : null },
        ]}
      />
    </section>
  )
}

TaskHistoryDetails.displayName = 'TaskHistoryDetails'
