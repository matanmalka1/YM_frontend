import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/primitives/Button'
import { DatePicker } from '@/components/ui/inputs/DatePicker'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { Textarea } from '@/components/ui/inputs/Textarea'
import { workQueueSourceTypeLabels } from '@/features/workQueue'
import { taskPriorityLabels, taskPriorityValues, taskRoleLabels } from '../constants'
import type { Task, TaskCreateRequest, TaskPriority, TaskUpdateRequest } from '../api/contracts'
import { useTaskSourcePicker } from '../hooks/useTaskSourcePicker'
import { TaskSourceSection } from './TaskSourceSection'
import type { TaskSourceContext } from '../types'

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

const sourceTypeLabel = (sourceDomain?: string | null) =>
  sourceDomain && sourceDomain in workQueueSourceTypeLabels
    ? workQueueSourceTypeLabels[sourceDomain as keyof typeof workQueueSourceTypeLabels]
    : 'פריט עבודה'

export const TaskModal: React.FC<TaskModalProps> = ({ mode, task, source, isLoading, onSubmit, onClose }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [dueDate, setDueDate] = useState('')
  const [assignedRole, setAssignedRole] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [pendingSource, setPendingSource] = useState<{ domain: string; id: number } | null>(null)
  const [sourceCleared, setSourceCleared] = useState(false)
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false)

  const {
    selectedClientId,
    selectedClientName,
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

  useEffect(() => {
    if (mode === 'create') {
      setTitle('')
      setDescription('')
      setPriority('normal')
      setDueDate(toDateInput(source?.due_date))
      setAssignedRole('')
      resetSourcePicker()
    }
  }, [mode, source, resetSourcePicker])

  useEffect(() => {
    if ((mode === 'edit' || mode === 'link') && task) {
      setTitle(task.title ?? '')
      setDescription(task.description ?? '')
      setPriority(task.priority ?? 'normal')
      setDueDate(toDateInput(task.due_date))
      setAssignedRole(task.assigned_role ?? '')
      resetSourcePicker()
      setSourcePickerOpen(mode === 'link')
    }
  }, [mode, task, resetSourcePicker])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!onSubmit) return
    if (isLinkMode) {
      if (hasExistingSource || !pendingSource) return
      onSubmit({ source_domain: pendingSource.domain, source_id: pendingSource.id })
      return
    }
    if (readonly || !title.trim()) return
    const base = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      due_date: dueDate || undefined,
      assigned_role: assignedRole || undefined,
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
    onClientSelect: (id: number, name: string) => {
      selectClient(id, name)
    },
    onClientClear: () => {
      clearClient()
      setClientSearch('')
      setPendingSource(null)
    },
    onSourceSelect: (domain: string, id: number) => {
      setSourceCleared(false)
      setPendingSource({ domain, id })
    },
    onSourceDeselect: () => {
      setPendingSource(null)
      setSourceCleared(false)
    },
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{modalTitle}</h2>
          {!isTaskLoading && !isLinkMode && (source || hasExistingSource) && (
            <div className="mt-3">
              <TaskSourceSection {...sourceSectionProps} />
            </div>
          )}
        </div>

        {isTaskLoading ? (
          <div className="space-y-4">
            <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
              טוען פרטי משימה...
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="ghost" onClick={onClose}>
                סגור
              </Button>
            </div>
          </div>
        ) : isLinkMode ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <TaskSourceSection {...sourceSectionProps} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                ביטול
              </Button>
              <Button type="submit" disabled={hasExistingSource || !pendingSource || isLoading} isLoading={isLoading}>
                שמור קישור
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="כותרת *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={readonly}
              required
            />
            <Textarea
              label="פרטים"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={readonly}
              rows={4}
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Select
                options={priorityOptions}
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                label="עדיפות"
                disabled={readonly}
              />
              <DatePicker label="תאריך יעד" value={dueDate} onChange={setDueDate} disabled={readonly} />
            </div>
            <Select
              options={roleOptions}
              value={assignedRole}
              onChange={(e) => setAssignedRole(e.target.value)}
              label="שיוך לתפקיד"
              disabled={readonly}
            />
            {!source && !hasExistingSource && <TaskSourceSection {...sourceSectionProps} />}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                סגור
              </Button>
              {!readonly && (
                <Button type="submit" disabled={!title.trim() || isLoading} isLoading={isLoading}>
                  {mode === 'edit' ? 'שמור' : 'צור משימה'}
                </Button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

TaskModal.displayName = 'TaskModal'
