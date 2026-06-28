import { GLOBAL_UI_MESSAGES } from '@/messages'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { DatePicker } from '@/components/ui/inputs/DatePicker'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { Textarea } from '@/components/ui/inputs/Textarea'
import { taskPriorityLabels, taskPriorityValues, taskRoleLabels } from '../../constants/labels'
import type { TaskFormValues } from '../../schemas'
import { TASKS_MESSAGES } from '../../messages'

interface TaskDetailsFieldsProps {
  register: UseFormRegister<TaskFormValues>
  errors: FieldErrors<TaskFormValues>
  values: TaskFormValues
  assigneeOptions: Array<{ value: string; label: string }>
  readonly: boolean
  onDueDateChange: (value: string) => void
  onAssigneeChange: (value: string) => void
  onRoleChange: (value: TaskFormValues['assignedRole']) => void
}

const priorityOptions = taskPriorityValues.map((value) => ({ value, label: taskPriorityLabels[value] }))

const roleOptions = [
  { value: '', label: TASKS_MESSAGES.form.unconfigured },
  { value: 'advisor', label: taskRoleLabels.advisor },
  { value: 'secretary', label: taskRoleLabels.secretary },
]

export const TaskDetailsFields: React.FC<TaskDetailsFieldsProps> = ({
  register,
  errors,
  values,
  assigneeOptions,
  readonly,
  onDueDateChange,
  onAssigneeChange,
  onRoleChange,
}) => (
  <>
    <Input
      label={TASKS_MESSAGES.form.titleLabel}
      error={errors.title?.message}
      disabled={readonly}
      {...register('title')}
    />
    <Textarea
      label={GLOBAL_UI_MESSAGES.common.details}
      error={errors.description?.message}
      disabled={readonly}
      rows={4}
      {...register('description')}
    />
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Select
        label={TASKS_MESSAGES.form.priorityLabel}
        options={priorityOptions}
        disabled={readonly}
        {...register('priority')}
      />
      <DatePicker
        label={TASKS_MESSAGES.form.dueDateLabel}
        value={values.dueDate}
        onChange={onDueDateChange}
        disabled={readonly}
      />
    </div>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Select
        label={TASKS_MESSAGES.form.assignedUserLabel}
        options={[{ value: '', label: TASKS_MESSAGES.form.unassigned }, ...assigneeOptions]}
        value={values.assignedToUserId}
        onChange={(event) => onAssigneeChange(event.target.value)}
        disabled={readonly}
      />
      <Select
        label={TASKS_MESSAGES.form.assignedRoleLabel}
        options={roleOptions}
        value={values.assignedRole}
        onChange={(event) => onRoleChange(event.target.value as TaskFormValues['assignedRole'])}
        disabled={readonly}
      />
    </div>
  </>
)

TaskDetailsFields.displayName = 'TaskDetailsFields'
