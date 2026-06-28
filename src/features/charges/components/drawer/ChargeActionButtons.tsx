import { CheckCircle2 } from 'lucide-react'
import { Button } from '../../../../components/ui/primitives/Button'
import { canCancel, canIssue, canMarkPaid } from '../../utils/chargeUtils'
import type { BackendAction } from '@/lib/actions/types'
import { CHARGES_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface ChargeActionButtonsProps {
  actions?: BackendAction[] | null
  disabled?: boolean
  onIssue: React.MouseEventHandler<HTMLButtonElement>
  onMarkPaid: React.MouseEventHandler<HTMLButtonElement>
  onCancel: React.MouseEventHandler<HTMLButtonElement>
  size?: 'sm' | 'inline'
}

export const ChargeActionButtons: React.FC<ChargeActionButtonsProps> = ({
  actions,
  disabled = false,
  onIssue,
  onMarkPaid,
  onCancel,
  size = 'inline',
}) => {
  const gap = size === 'sm' ? 'flex flex-wrap gap-2 py-2' : 'flex flex-wrap items-center gap-1.5'

  return (
    <div className={gap}>
      {canIssue(actions) && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={onIssue}
          className="border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 text-xs px-2.5 py-1"
        >
          {CHARGES_MESSAGES.actions.issue}
        </Button>
      )}
      {canMarkPaid(actions) && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          disabled={disabled}
          onClick={onMarkPaid}
          className="border-positive-200 bg-positive-50 text-positive-700 hover:bg-positive-100 text-xs px-2.5 py-1"
        >
          {CHARGES_MESSAGES.actions.markPaid}
        </Button>
      )}
      {canCancel(actions) && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={onCancel}
          className="border-negative-200 bg-negative-50 text-negative-700 hover:bg-negative-100 text-xs px-2.5 py-1"
        >
          {GLOBAL_UI_MESSAGES.actions.cancel}
        </Button>
      )}
    </div>
  )
}

ChargeActionButtons.displayName = 'ChargeActionButtons'
