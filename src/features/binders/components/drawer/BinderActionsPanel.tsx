import { Button } from '@/components/ui/primitives/Button'
import { BinderActionButtons } from './BinderActionButtons'

interface BinderActionsPanelProps {
  status: string
  disabled?: boolean
  onMarkReady: React.MouseEventHandler<HTMLButtonElement>
  onRevertReady?: React.MouseEventHandler<HTMLButtonElement>
  onReturn?: React.MouseEventHandler<HTMLButtonElement>
  onBulkReady?: React.MouseEventHandler<HTMLButtonElement>
  onOpenHandover?: React.MouseEventHandler<HTMLButtonElement>
}

export const BinderActionsPanel: React.FC<BinderActionsPanelProps> = ({
  status,
  disabled = false,
  onMarkReady,
  onRevertReady,
  onReturn,
  onBulkReady,
  onOpenHandover,
}) => {
  if (status !== 'in_office' && status !== 'closed_in_office' && status !== 'ready_for_pickup') {
    return null
  }

  return (
    <div className="pt-2 flex items-center gap-2">
      <BinderActionButtons
        status={status}
        disabled={disabled}
        onMarkReady={onMarkReady}
        onRevertReady={onRevertReady}
        onReturn={onReturn}
        size="sm"
      />
      {(status === 'in_office' || status === 'closed_in_office') && onBulkReady && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs px-2.5 py-1"
          onClick={onBulkReady}
          disabled={disabled}
        >
          מוכן עד תקופה
        </Button>
      )}
      {status === 'ready_for_pickup' && onOpenHandover && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-primary-200 bg-primary-50 text-primary-800 hover:bg-primary-100 text-xs px-2.5 py-1"
          onClick={onOpenHandover}
          disabled={disabled}
        >
          מסירת כמה קלסרים
        </Button>
      )}
    </div>
  )
}

BinderActionsPanel.displayName = 'BinderActionsPanel'
