import { Filter, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { DatePicker, Select } from '@/components/ui/inputs'
import type { TaskPriority, TaskStatus } from '../api/contracts'
import type { TasksFilterValues, TasksSelectOption } from '../types'
import type { UserRole } from '@/types'
import type { WorkQueueSourceType } from '@/features/workQueue'

interface TasksFiltersPanelProps {
  filters: TasksFilterValues
  hasFilters: boolean
  statusOptions: Array<TasksSelectOption<TaskStatus | ''>>
  priorityOptions: Array<TasksSelectOption<TaskPriority | ''>>
  roleOptions: Array<TasksSelectOption<UserRole | ''>>
  userOptions: TasksSelectOption[]
  sourceOptions: Array<TasksSelectOption<WorkQueueSourceType | ''>>
  onStatusChange: (value: TaskStatus | '') => void
  onPriorityChange: (value: TaskPriority | '') => void
  onAssignedRoleChange: (value: UserRole | '') => void
  onAssignedUserChange: (value: string) => void
  onSourceDomainChange: (value: WorkQueueSourceType | '') => void
  onDueAfterChange: (value: string) => void
  onDueBeforeChange: (value: string) => void
  onReset: () => void
}

export const TasksFiltersPanel: React.FC<TasksFiltersPanelProps> = ({
  filters,
  hasFilters,
  statusOptions,
  priorityOptions,
  roleOptions,
  userOptions,
  sourceOptions,
  onStatusChange,
  onPriorityChange,
  onAssignedRoleChange,
  onAssignedUserChange,
  onSourceDomainChange,
  onDueAfterChange,
  onDueBeforeChange,
  onReset,
}) => (
  <section className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
          <Filter className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold leading-tight text-gray-900">סינון משימות</p>
          <p className="mt-0.5 text-[11px] leading-tight text-gray-500">סטטוס, עדיפות, שיוך, מקור וטווח יעד</p>
        </div>
      </div>

      {hasFilters ? (
        <Button size="sm" variant="outline" onClick={onReset} className="rounded-xl">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          נקה פילטרים
        </Button>
      ) : null}
    </div>

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      <Select
        label="סטטוס"
        size="sm"
        value={filters.status}
        options={statusOptions}
        fieldClassName="min-w-0"
        className="rounded-xl bg-gray-50/80"
        onChange={(event) => onStatusChange(event.target.value as TaskStatus | '')}
      />
      <Select
        label="עדיפות"
        size="sm"
        value={filters.priority}
        options={priorityOptions}
        fieldClassName="min-w-0"
        className="rounded-xl bg-gray-50/80"
        onChange={(event) => onPriorityChange(event.target.value as TaskPriority | '')}
      />
      <Select
        label="תפקיד"
        size="sm"
        value={filters.assignedRole}
        options={roleOptions}
        fieldClassName="min-w-0"
        className="rounded-xl bg-gray-50/80"
        onChange={(event) => onAssignedRoleChange(event.target.value as UserRole | '')}
      />
      <Select
        label="משתמש"
        size="sm"
        value={filters.assignedUser}
        options={userOptions}
        fieldClassName="min-w-0"
        className="rounded-xl bg-gray-50/80"
        onChange={(event) => onAssignedUserChange(event.target.value)}
      />
      <Select
        label="מקור"
        size="sm"
        value={filters.sourceDomain}
        options={sourceOptions}
        fieldClassName="min-w-0"
        className="rounded-xl bg-gray-50/80"
        onChange={(event) => onSourceDomainChange(event.target.value as WorkQueueSourceType | '')}
      />
      <DatePicker label="מתאריך" value={filters.dueAfter} onChange={onDueAfterChange} compact />
      <DatePicker label="עד תאריך" value={filters.dueBefore} onChange={onDueBeforeChange} compact />
    </div>
  </section>
)

TasksFiltersPanel.displayName = 'TasksFiltersPanel'
