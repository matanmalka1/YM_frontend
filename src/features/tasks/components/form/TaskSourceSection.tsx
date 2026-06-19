import { Link2Off } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { Select } from '@/components/ui/inputs/Select'
import { Tooltip } from '@/components/ui/primitives/Tooltip'
import { ClientSearchInput, SelectedClientDisplay } from '@/components/shared/client/ClientSearchInput'
import type { WorkQueueItem, WorkQueueSourceType } from '@/features/workQueue'
import type { TaskSourceContext } from '../../types'

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
  workQueueItems: WorkQueueItem[]
  isLoadingItems: boolean
  clientSearch: string
  sourceOptions: Array<{ value: string; label: string }>
  pendingSource: { domain: WorkQueueSourceType; id: number } | null
  onClearSource: () => void
  onOpenPicker: () => void
  onCancelPicker: () => void
  onClientSearchChange: (value: string) => void
  onClientSelect: (id: number, name: string, officeClientNumber?: number | null) => void
  onClientClear: () => void
  onSourceSelect: (domain: WorkQueueSourceType, id: number) => void
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
        <div className="text-xs font-medium text-primary-700">פריט עבודה מקושר</div>
        <div className="mt-1 font-medium">{source.title}</div>
        {source.client_name && <div className="mt-0.5 text-xs text-primary-700">לקוח: {source.client_name}</div>}
        {linkedCount > 0 && (
          <div className="mt-2 text-xs font-medium text-orange-800">כבר קיימות {linkedCount} משימות קשורות</div>
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

  if (hasExistingSource && !pendingSource) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
        <div className="min-w-0">
          <div className="text-xs font-medium text-gray-500">פריט עבודה מקושר</div>
          <div className="truncate font-medium text-gray-800">
            {sourceCleared ? 'הקישור יוסר בשמירה' : existingSourceTitle}
          </div>
        </div>
        {!readonly && !isLinkMode && !sourceCleared && (
          <Tooltip text="נתק את המשימה מהפריט המקושר">
            <button
              type="button"
              onClick={onClearSource}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
            >
              <Link2Off className="h-3.5 w-3.5" />
              נתק
            </button>
          </Tooltip>
        )}
      </div>
    )
  }

  if (readonly) return null

  if (!isLinkMode && !sourcePickerOpen) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
        <span className="text-gray-500">המשימה אינה מקושרת לפריט עבודה.</span>
        <Button type="button" variant="ghost" size="sm" onClick={onOpenPicker}>
          קשר לפריט
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3">
      {isLinkMode && taskTitle && (
        <div className="rounded-md bg-white px-3 py-2 text-sm">
          <div className="text-xs font-medium text-gray-500">משימה</div>
          <div className="font-medium text-gray-900">{taskTitle}</div>
        </div>
      )}
      <div>
        <div className="text-sm font-medium text-gray-900">פריט עבודה לקישור</div>
        <div className="text-xs text-gray-500">בחר לקוח ואז פריט פתוח שעדיין אין לו משימה.</div>
      </div>

      {selectedClientId && selectedClientName ? (
        <SelectedClientDisplay
          name={selectedClientName}
          officeClientNumber={selectedClientOfficeNumber}
          onClear={onClientClear}
          label="לקוח"
        />
      ) : (
        <ClientSearchInput
          value={clientSearch}
          onChange={onClientSearchChange}
          onSelect={(c) => onClientSelect(c.id, c.name, c.office_client_number)}
          label="לקוח"
          helperText="הקלד לפחות 2 תווים כדי לחפש לקוח"
        />
      )}

      {selectedClientId && (
        <>
          <Select
            label="פריט לקישור"
            options={[
              {
                value: '',
                label: isLoadingItems
                  ? 'טוען...'
                  : sourceOptions.length
                    ? 'בחר פריט...'
                    : 'אין פריטים פתוחים ללא משימה',
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
              const item = workQueueItems.find((i) => `${i.source_type}:${i.source_id}` === val)
              if (item) onSourceSelect(item.source_type, item.source_id)
            }}
            disabled={isLoadingItems || sourceOptions.length === 0}
          />
          {!isLoadingItems && sourceOptions.length === 0 && (
            <p className="text-xs text-gray-500">אין ללקוח הזה פריטים פתוחים שאפשר לקשר למשימה.</p>
          )}
        </>
      )}
      {!isLinkMode && (
        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onCancelPicker}>
            השאר ללא קישור
          </Button>
        </div>
      )}
    </div>
  )
}

TaskSourceSection.displayName = 'TaskSourceSection'
