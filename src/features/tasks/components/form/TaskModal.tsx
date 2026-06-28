import { useCallback, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { Modal } from '@/components/ui/overlays/Modal'
import { ModalFormActions } from '@/components/ui/overlays/ModalFormActions'
import { useActiveUserOptions } from '@/features/users'
import { workQueueSourceTypeLabels } from '@/features/workQueue'
import type { WorkQueueSourceType } from '@/features/workQueue'
import type { Task, TaskCreateRequest, TaskUpdateRequest } from '../../api/contracts'
import { useTaskSourcePicker } from '../../hooks/useTaskSourcePicker'
import { getTaskFormDefaultValues, taskFormSchema, type TaskFormValues } from '../../schemas'
import type { TaskSourceContext } from '../../types'
import { TaskDetailsFields } from './TaskDetailsFields'
import { TaskSourceSection } from './TaskSourceSection'
import { TASKS_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface TaskModalProps {
  mode: 'create' | 'edit' | 'view' | 'link'
  task?: Task | null
  source?: TaskSourceContext | null
  clientRecordId?: number
  error?: string | null
  isLoading?: boolean
  onSubmit?: (data: TaskCreateRequest | TaskUpdateRequest) => void
  onClose: () => void
}

const sourceTypeLabel = (sourceDomain?: string | null) =>
  sourceDomain && sourceDomain in workQueueSourceTypeLabels
    ? workQueueSourceTypeLabels[sourceDomain as keyof typeof workQueueSourceTypeLabels]
    : TASKS_MESSAGES.source.fallbackType

export const TaskModal: React.FC<TaskModalProps> = ({
  mode,
  task,
  source,
  clientRecordId,
  error,
  isLoading,
  onSubmit,
  onClose,
}) => {
  const readonly = mode === 'view'
  const isLinkMode = mode === 'link'
  const form = useForm<TaskFormValues>({
    defaultValues: getTaskFormDefaultValues(task, source?.due_date),
    resolver: zodResolver(taskFormSchema),
  })
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = form
  const [clientSearch, setClientSearch] = useState('')
  const [pendingSource, setPendingSource] = useState<{ domain: WorkQueueSourceType; id: number } | null>(null)
  const [sourceCleared, setSourceCleared] = useState(false)
  const [sourcePickerOpen, setSourcePickerOpen] = useState(() => mode === 'link')
  const usersQuery = useActiveUserOptions()
  const sourcePicker = useTaskSourcePicker()

  const linkedCount = source?.linked_tasks_count ?? source?.linked_tasks?.length ?? 0
  const isTaskLoading = (mode === 'edit' || mode === 'link') && !task
  const existingSourceDomain = task?.source_domain ?? null
  const existingSourceId = task?.source_id ?? null
  const hasExistingSource = existingSourceDomain != null && existingSourceId != null
  const existingSourceTitle = source?.title ?? `${sourceTypeLabel(existingSourceDomain)} #${existingSourceId}`
  const sourceOptions = sourcePicker.workQueueItems.map((item) => ({
    value: `${item.source_type}:${item.source_id}`,
    label: sourcePicker.sourceLabel(item),
  }))
  const assigneeOptions = (usersQuery.data?.items ?? []).map((user) => ({
    value: String(user.id),
    label: user.full_name,
  }))

  const resetSourcePicker = useCallback(() => {
    setClientSearch('')
    sourcePicker.clearClient()
    setPendingSource(null)
    setSourceCleared(false)
    setSourcePickerOpen(false)
  }, [sourcePicker])

  const submitForm = (values: TaskFormValues) => {
    if (!onSubmit) return
    if (isLinkMode) {
      if (!hasExistingSource && pendingSource)
        onSubmit({ source_domain: pendingSource.domain, source_id: pendingSource.id })
      return
    }
    if (readonly) return

    const base = {
      title: values.title,
      description: values.description.trim() || null,
      priority: values.priority,
      due_date: values.dueDate || null,
      assigned_to_user_id: values.assignedToUserId ? Number(values.assignedToUserId) : null,
      assigned_role: values.assignedRole || null,
    }
    if (mode === 'create') {
      onSubmit({
        ...base,
        description: base.description ?? undefined,
        due_date: base.due_date ?? undefined,
        assigned_to_user_id: base.assigned_to_user_id ?? undefined,
        assigned_role: base.assigned_role ?? undefined,
        ...(clientRecordId ? { client_record_id: clientRecordId } : {}),
        ...(source
          ? { source_domain: source.source_domain, source_id: source.source_id }
          : pendingSource
            ? { source_domain: pendingSource.domain, source_id: pendingSource.id }
            : {}),
      })
      return
    }
    onSubmit({
      ...base,
      ...(sourceCleared
        ? { source_domain: null, source_id: null }
        : pendingSource
          ? { source_domain: pendingSource.domain, source_id: pendingSource.id }
          : {}),
    })
  }

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
    selectedClientId: sourcePicker.selectedClientId,
    selectedClientName: sourcePicker.selectedClientName,
    selectedClientOfficeNumber: sourcePicker.selectedClientOfficeNumber,
    workQueueItems: sourcePicker.workQueueItems,
    isLoadingItems: sourcePicker.isLoadingItems,
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
    onClientSelect: sourcePicker.selectClient,
    onClientClear: () => {
      sourcePicker.clearClient()
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
  const hasUnsavedChanges = isDirty || pendingSource !== null || sourceCleared
  const modalTitle = isLinkMode
    ? TASKS_MESSAGES.modal.linkTitle
    : mode === 'create'
      ? source
        ? TASKS_MESSAGES.modal.createForWorkItemTitle
        : TASKS_MESSAGES.modal.createTitle
      : mode === 'edit'
        ? TASKS_MESSAGES.modal.editTitle
        : TASKS_MESSAGES.modal.viewTitle

  const footer =
    isTaskLoading || readonly ? (
      <div className="flex justify-end">
        <Button type="button" variant="ghost" onClick={onClose}>
          {TASKS_MESSAGES.actions.close}
        </Button>
      </div>
    ) : (
      <ModalFormActions
        cancelVariant="ghost"
        cancelLabel={isLinkMode ? GLOBAL_UI_MESSAGES.actions.cancel : TASKS_MESSAGES.actions.close}
        onCancel={onClose}
        submitType="submit"
        submitForm={formId}
        submitLabel={
          isLinkMode
            ? TASKS_MESSAGES.actions.saveLink
            : mode === 'edit'
              ? GLOBAL_UI_MESSAGES.actions.save
              : TASKS_MESSAGES.actions.createTask
        }
        submitDisabled={isLinkMode ? hasExistingSource || !pendingSource : false}
        isLoading={isLoading}
      />
    )

  return (
    <Modal open title={modalTitle} footer={footer} isDirty={!readonly && hasUnsavedChanges} onClose={onClose}>
      {isTaskLoading ? (
        <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
          {TASKS_MESSAGES.modal.loadingDetails}
        </div>
      ) : (
        <form id={formId} onSubmit={handleSubmit(submitForm)} className="space-y-4">
          {error ? <Alert variant="error" message={error} /> : null}
          {isLinkMode ? (
            <TaskSourceSection {...sourceSectionProps} />
          ) : (
            <>
              {source || hasExistingSource ? <TaskSourceSection {...sourceSectionProps} /> : null}
              <TaskDetailsFields
                register={register}
                errors={errors}
                values={watch()}
                assigneeOptions={assigneeOptions}
                readonly={readonly}
                onDueDateChange={(value) => setValue('dueDate', value, { shouldDirty: true })}
                onAssigneeChange={(value) => setValue('assignedToUserId', value, { shouldDirty: true })}
                onRoleChange={(value) => setValue('assignedRole', value, { shouldDirty: true })}
              />
              {!source && !hasExistingSource ? <TaskSourceSection {...sourceSectionProps} /> : null}
            </>
          )}
        </form>
      )}
    </Modal>
  )
}

TaskModal.displayName = 'TaskModal'
