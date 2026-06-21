import { useCallback, useReducer, useState } from 'react'
import { Button } from '@/components/ui/primitives/Button'
import { Modal } from '@/components/ui/overlays/Modal'
import { ModalFormActions } from '@/components/ui/overlays/ModalFormActions'
import { DatePicker } from '@/components/ui/inputs/DatePicker'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { Textarea } from '@/components/ui/inputs/Textarea'
import { workQueueSourceTypeLabels } from '@/features/workQueue'
import { taskPriorityLabels, taskPriorityValues, taskRoleLabels } from '../../constants/labels'
import {
  parseTaskPriority,
  type Task,
  type TaskCreateRequest,
  type TaskPriority,
  type TaskUpdateRequest,
} from '../../api/contracts'
import type { UserRole } from '@/types'
import type { WorkQueueSourceType } from '@/features/workQueue'
import { useTaskSourcePicker } from '../../hooks/useTaskSourcePicker'
import { TaskSourceSection } from './TaskSourceSection'
import type { TaskSourceContext } from '../../types'

interface TaskModalProps {
  mode: 'create' | 'edit' | 'view' | 'link'
  task?: Task | null
  source?: TaskSourceContext | null
  isLoading?: boolean
  onSubmit?: (data: TaskCreateRequest | TaskUpdateRequest) => void
  onClose: () => void
}

const priorityOptions = taskPriorityValues.map((value) => ({ value, label: taskPriorityLabels[value] }))

const roleOptions = [
  { value: '', label: 'לא מוגדר' },
  { value: 'advisor', label: taskRoleLabels.advisor },
  { value: 'secretary', label: taskRoleLabels.secretary },
]

const toDateInput = (value?: string | null) => value?.slice(0, 10) ?? ''

const parseAssignedRole = (value: string): UserRole | '' => (value === 'advisor' || value === 'secretary' ? value : '')

const sourceTypeLabel = (sourceDomain?: string | null) =>
  sourceDomain && sourceDomain in workQueueSourceTypeLabels
    ? workQueueSourceTypeLabels[sourceDomain as keyof typeof workQueueSourceTypeLabels]
    : 'פריט עבודה'

interface TaskFormState {
  title: string
  description: string
  priority: TaskPriority
  dueDate: string
  assignedRole: UserRole | ''
}

export const TaskModal: React.FC<TaskModalProps> = ({ mode, task, source, isLoading, onSubmit, onClose }) => {
  // Fields are seeded once from props (the modal is remounted with a `key` at the call site
  // whenever mode/task/source change), so no prop->state syncing effect is needed.
  const [form, setForm] = useReducer(
    (state: TaskFormState, patch: Partial<TaskFormState>) => ({ ...state, ...patch }),
    undefined,
    (): TaskFormState => ({
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: task?.priority ?? 'normal',
      dueDate: task ? toDateInput(task.due_date) : toDateInput(source?.due_date),
      assignedRole: task?.assigned_role ?? '',
    }),
  )
  const [clientSearch, setClientSearch] = useState('')
  const [pendingSource, setPendingSource] = useState<{ domain: WorkQueueSourceType; id: number } | null>(null)
  const [sourceCleared, setSourceCleared] = useState(false)
  const [sourcePickerOpen, setSourcePickerOpen] = useState(() => mode === 'link')

  const {
    selectedClientId,
    selectedClientName,
    selectedClientOfficeNumber,
    selectClient,
    clearClient,
    workQueueItems,
    isLoadingItems,
    sourceLabel,
  } = useTaskSourcePicker()

  const readonly = mode === 'view'
  const isLinkMode = mode === 'link'
  const linkedCount = source?.linked_tasks_count ?? source?.linked_tasks?.length ?? 0
  const isTaskLoading = (mode === 'edit' || mode === 'link') && !task

  const existingSourceDomain = task?.source_domain ?? null
  const existingSourceId = task?.source_id ?? null
  const hasExistingSource = existingSourceDomain != null && existingSourceId != null
  const existingSourceTitle = source?.title ?? `${sourceTypeLabel(existingSourceDomain)} #${existingSourceId}`

  const sourceOptions = workQueueItems.map((item) => ({
    value: `${item.source_type}:${item.source_id}`,
    label: sourceLabel(item),
  }))

  const resetSourcePicker = useCallback(() => {
    setClientSearch('')
    clearClient()
    setPendingSource(null)
    setSourceCleared(false)
    setSourcePickerOpen(false)
  }, [clearClient])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!onSubmit) return
    if (isLinkMode) {
      if (hasExistingSource || !pendingSource) return
      onSubmit({ source_domain: pendingSource.domain, source_id: pendingSource.id })
      return
    }
    if (readonly || !form.title.trim()) return
    const base = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      priority: form.priority,
      due_date: form.dueDate || undefined,
      assigned_role: form.assignedRole || undefined,
    }
    if (mode === 'create') {
      const createPayload: TaskCreateRequest = source
        ? { ...base, source_domain: source.source_domain, source_id: source.source_id }
        : pendingSource
          ? { ...base, source_domain: pendingSource.domain, source_id: pendingSource.id }
          : base
      onSubmit(createPayload)
    } else {
      const updatePayload: TaskUpdateRequest = sourceCleared
        ? { ...base, source_domain: null, source_id: null }
        : pendingSource
          ? { ...base, source_domain: pendingSource.domain, source_id: pendingSource.id }
          : base
      onSubmit(updatePayload)
    }
  }

  const modalTitle = isLinkMode
    ? 'קישור משימה לפריט עבודה'
    : mode === 'create'
      ? source
        ? 'משימה חדשה לפריט עבודה'
        : 'משימה חדשה'
      : mode === 'edit'
        ? 'עריכת משימה'
        : 'פרטי משימה'

  const sourceSectionProps = {
    source,
    isLinkMode,
    readonly,
    linkedCount,
    hasExistingSource,
    sourceCleared,
    existingSourceTitle,
    sourcePickerOpen,
    taskTitle: task?.title,
    selectedClientId,
    selectedClientName,
    selectedClientOfficeNumber,
    workQueueItems,
    isLoadingItems,
    clientSearch,
    sourceOptions,
    pendingSource,
    onClearSource: () => {
      setSourceCleared(true)
      setPendingSource(null)
      setSourcePickerOpen(false)
    },
    onOpenPicker: () => setSourcePickerOpen(true),
    onCancelPicker: resetSourcePicker,
    onClientSearchChange: setClientSearch,
    onClientSelect: (id: number, name: string, officeClientNumber?: number | null) => {
      selectClient(id, name, officeClientNumber)
    },
    onClientClear: () => {
      clearClient()
      setClientSearch('')
      setPendingSource(null)
    },
    onSourceSelect: (domain: WorkQueueSourceType, id: number) => {
      setSourceCleared(false)
      setPendingSource({ domain, id })
    },
    onSourceDeselect: () => {
      setPendingSource(null)
      setSourceCleared(false)
    },
  }

  const formId = 'task-form'

  let body: React.ReactNode
  let footer: React.ReactNode

  if (isTaskLoading) {
    body = (
      <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
        טוען פרטי משימה...
      </div>
    )
    footer = (
      <div className="flex justify-end">
        <Button type="button" variant="ghost" onClick={onClose}>
          סגור
        </Button>
      </div>
    )
  } else if (isLinkMode) {
    body = (
      <form id={formId} onSubmit={handleSubmit}>
        <TaskSourceSection {...sourceSectionProps} />
      </form>
    )
    footer = (
      <ModalFormActions
        cancelVariant="ghost"
        cancelLabel="ביטול"
        onCancel={onClose}
        submitType="submit"
        submitForm={formId}
        submitLabel="שמור קישור"
        submitDisabled={hasExistingSource || !pendingSource}
        isLoading={isLoading}
      />
    )
  } else {
    body = (
      <>
        {(source || hasExistingSource) && (
          <div className="mb-4">
            <TaskSourceSection {...sourceSectionProps} />
          </div>
        )}
        <form id={formId} onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="כותרת *"
            value={form.title}
            onChange={(e) => setForm({ title: e.target.value })}
            disabled={readonly}
            required
          />
          <Textarea
            label="פרטים"
            value={form.description}
            onChange={(e) => setForm({ description: e.target.value })}
            disabled={readonly}
            rows={4}
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Select
              options={priorityOptions}
              value={form.priority}
              onChange={(e) => setForm({ priority: parseTaskPriority(e.target.value) ?? form.priority })}
              label="עדיפות"
              disabled={readonly}
            />
            <DatePicker
              label="תאריך יעד"
              value={form.dueDate}
              onChange={(value) => setForm({ dueDate: value })}
              disabled={readonly}
            />
          </div>
          <Select
            options={roleOptions}
            value={form.assignedRole}
            onChange={(e) => setForm({ assignedRole: parseAssignedRole(e.target.value) })}
            label="שיוך לתפקיד"
            disabled={readonly}
          />
          {!source && !hasExistingSource && <TaskSourceSection {...sourceSectionProps} />}
        </form>
      </>
    )
    footer = readonly ? (
      <div className="flex justify-end">
        <Button type="button" variant="ghost" onClick={onClose}>
          סגור
        </Button>
      </div>
    ) : (
      <ModalFormActions
        cancelVariant="ghost"
        cancelLabel="סגור"
        onCancel={onClose}
        submitType="submit"
        submitForm={formId}
        submitLabel={mode === 'edit' ? 'שמור' : 'צור משימה'}
        submitDisabled={!form.title.trim()}
        isLoading={isLoading}
      />
    )
  }

  return (
    <Modal open title={modalTitle} footer={footer} onClose={onClose}>
      {body}
    </Modal>
  )
}

TaskModal.displayName = 'TaskModal'
