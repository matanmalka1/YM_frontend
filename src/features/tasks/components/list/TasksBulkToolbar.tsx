import { Alert } from '@/components/ui/overlays/Alert'
import { Select } from '@/components/ui/inputs'
import { BulkSelectionActionButton, BulkSelectionToolbar } from '@/components/ui/table'
import { TASKS_MESSAGES } from '../../messages'

interface TasksBulkToolbarProps {
  feedback: { message: string; hasFailures: boolean } | null
  selectedCount: number
  assigneeId: string
  assigneeOptions: Array<{ value: string; label: string }>
  isLoading: boolean
  isCompleteLoading: boolean
  isAssignLoading: boolean
  onDismissFeedback: () => void
  onAssigneeChange: (value: string) => void
  onClear: () => void
  onComplete: () => void
  onAssign: (assigneeUserId: number | null) => void
}

export const TasksBulkToolbar: React.FC<TasksBulkToolbarProps> = ({
  feedback,
  selectedCount,
  assigneeId,
  assigneeOptions,
  isLoading,
  isCompleteLoading,
  isAssignLoading,
  onDismissFeedback,
  onAssigneeChange,
  onClear,
  onComplete,
  onAssign,
}) => (
  <>
    {feedback ? (
      <Alert
        variant={feedback.hasFailures ? 'warning' : 'success'}
        message={feedback.message}
        onDismiss={onDismissFeedback}
        dismissible
      />
    ) : null}
    {selectedCount > 0 ? (
      <BulkSelectionToolbar selectedCount={selectedCount} loading={isLoading} onClear={onClear}>
        <BulkSelectionActionButton
          label={TASKS_MESSAGES.actions.completeBulk}
          onClick={onComplete}
          loading={isCompleteLoading}
          disabled={isLoading}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            size="xs"
            value={assigneeId}
            options={[{ value: '', label: TASKS_MESSAGES.clientTab.chooseAssignee }, ...assigneeOptions]}
            onChange={(event) => onAssigneeChange(event.target.value)}
            disabled={isLoading}
          />
          <BulkSelectionActionButton
            label={TASKS_MESSAGES.actions.assign}
            onClick={() => onAssign(Number(assigneeId))}
            loading={isAssignLoading}
            disabled={isLoading || assigneeId === ''}
          />
          <BulkSelectionActionButton
            label={TASKS_MESSAGES.actions.unassign}
            onClick={() => onAssign(null)}
            loading={isAssignLoading}
            disabled={isLoading}
          />
        </div>
      </BulkSelectionToolbar>
    ) : null}
  </>
)

TasksBulkToolbar.displayName = 'TasksBulkToolbar'
