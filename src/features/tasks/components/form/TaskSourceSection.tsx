import { Link2Off } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { Select } from '@/components/ui/inputs/Select'
import { ClientSearchInput, SelectedClientDisplay } from '@/features/clients/public'
import type { WorkItemSourceType } from '@/constants/workItemSources.constants'
import type { TaskLinkableSource } from '../../api/contracts'
import type { TaskSourceContext } from '../../types'
import { TASKS_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface TaskSourceSectionProps {
  source: TaskSourceContext | null | undefined
  isLinkMode: boolean
  readonly: boolean
  linkedCount: number
  hasExistingSource: boolean
  sourceCleared: boolean
  existingSourceTitle: string
  sourcePickerOpen: boolean
  taskTitle?: string | null
  selectedClientId: number | null
  selectedClientName: string | null
  selectedClientOfficeNumber: number | null
  workQueueItems: TaskLinkableSource[]
  isLoadingItems: boolean
  clientSearch: string
  sourceOptions: Array<{ value: string; label: string }>
  pendingSource: { domain: WorkItemSourceType; id: number } | null
  onClearSource: () => void
  onOpenPicker: () => void
  onCancelPicker: () => void
  onClientSearchChange: (value: string) => void
  onClientSelect: (id: number, name: string, officeClientNumber?: number | null) => void
  onClientClear: () => void
  onSourceSelect: (domain: WorkItemSourceType, id: number) => void
  onSourceDeselect: () => void
}

export const TaskSourceSection: React.FC<TaskSourceSectionProps> = ({
  source,
  isLinkMode,
  readonly,
  linkedCount,
  hasExistingSource,
  sourceCleared,
  existingSourceTitle,
  sourcePickerOpen,
  taskTitle,
  selectedClientId,
  selectedClientName,
  selectedClientOfficeNumber,
  workQueueItems,
  isLoadingItems,
  clientSearch,
  sourceOptions,
  pendingSource,
  onClearSource,
  onOpenPicker,
  onCancelPicker,
  onClientSearchChange,
  onClientSelect,
  onClientClear,
  onSourceSelect,
  onSourceDeselect,
}) => {
  if (source && !isLinkMode) {
    return (
      <div className="rounded-md border border-primary-100 bg-primary-50 p-3 text-sm text-primary-950">
        <div className="text-xs font-medium text-primary-700">{TASKS_MESSAGES.source.linkedWorkItem}</div>
        <div className="mt-1 font-medium">{source.title}</div>
        {source.client_name && (
          <div className="mt-0.5 text-xs text-primary-700">{TASKS_MESSAGES.source.clientLabel(source.client_name)}</div>
        )}
        {linkedCount > 0 && (
          <div className="mt-2 text-xs font-medium text-orange-800">{TASKS_MESSAGES.source.existingLinkedTasks(linkedCount)}</div>
        )}
        {source.linked_tasks?.length ? (
          <ul className="mt-2 list-inside list-disc text-xs text-primary-800">
            {source.linked_tasks.slice(0, 3).map((linked) => (
              <li key={linked.id}>
                {linked.title} · {linked.status}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    )
  }

  if (hasExistingSource && !pendingSource && !sourcePickerOpen) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
        <div className="min-w-0">
          <div className="text-xs font-medium text-gray-500">{TASKS_MESSAGES.source.linkedWorkItem}</div>
          <div className="truncate font-medium text-gray-800">
            {sourceCleared ? TASKS_MESSAGES.source.linkWillBeRemoved : existingSourceTitle}
          </div>
        </div>
        {!readonly && !isLinkMode && !sourceCleared && (
          <Button
            type="button"
            variant="link"
            size="sm"
            icon={<Link2Off className="h-3.5 w-3.5" aria-hidden="true" />}
            tooltip={TASKS_MESSAGES.source.unlinkTooltip}
            onClick={onClearSource}
          >
            {TASKS_MESSAGES.actions.unlink}
          </Button>
        )}
        {!readonly && !isLinkMode && sourceCleared ? (
          <Button type="button" variant="ghost" size="sm" onClick={onOpenPicker}>
            {TASKS_MESSAGES.actions.linkToItem}
          </Button>
        ) : null}
      </div>
    )
  }

  if (readonly) return null

  if (!isLinkMode && !sourcePickerOpen) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
        <span className="text-gray-500">{TASKS_MESSAGES.source.unlinkedMessage}</span>
        <Button type="button" variant="ghost" size="sm" onClick={onOpenPicker}>
          {TASKS_MESSAGES.actions.linkToItem}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3">
      {isLinkMode && taskTitle && (
        <div className="rounded-md bg-white px-3 py-2 text-sm">
          <div className="text-xs font-medium text-gray-500">{TASKS_MESSAGES.source.taskLabel}</div>
          <div className="font-medium text-gray-900">{taskTitle}</div>
        </div>
      )}
      <div>
        <div className="text-sm font-medium text-gray-900">{TASKS_MESSAGES.source.linkWorkItemTitle}</div>
        <div className="text-xs text-gray-500">{TASKS_MESSAGES.source.linkWorkItemHelp}</div>
      </div>

      {selectedClientId && selectedClientName ? (
        <SelectedClientDisplay
          name={selectedClientName}
          officeClientNumber={selectedClientOfficeNumber}
          onClear={onClientClear}
          label={GLOBAL_UI_MESSAGES.common.client}
        />
      ) : (
        <ClientSearchInput
          value={clientSearch}
          onChange={onClientSearchChange}
          onSelect={(c) => onClientSelect(c.id, c.name, c.office_client_number)}
          label={GLOBAL_UI_MESSAGES.common.client}
          helperText={TASKS_MESSAGES.source.clientSearchHelp}
        />
      )}

      {selectedClientId && (
        <>
          <Select
            label={TASKS_MESSAGES.source.itemToLink}
            options={[
              {
                value: '',
                label: isLoadingItems
                  ? GLOBAL_UI_MESSAGES.common.loading
                  : sourceOptions.length
                    ? TASKS_MESSAGES.source.chooseItem
                    : TASKS_MESSAGES.source.noOpenItems,
              },
              ...sourceOptions,
            ]}
            value={pendingSource ? `${pendingSource.domain}:${pendingSource.id}` : ''}
            onChange={(e) => {
              const val = e.target.value
              if (!val) {
                onSourceDeselect()
                return
              }
              const item = workQueueItems.find((i) => `${i.source_domain}:${i.source_id}` === val)
              if (item) onSourceSelect(item.source_domain, item.source_id)
            }}
            disabled={isLoadingItems || sourceOptions.length === 0}
          />
          {!isLoadingItems && sourceOptions.length === 0 && (
            <p className="text-xs text-gray-500">{TASKS_MESSAGES.source.noClientOpenItems}</p>
          )}
        </>
      )}
      {!isLinkMode && (
        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onCancelPicker}>
            {TASKS_MESSAGES.actions.leaveUnlinked}
          </Button>
        </div>
      )}
    </div>
  )
}

TaskSourceSection.displayName = 'TaskSourceSection'
