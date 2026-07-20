import { Check, CircleDollarSign, Pencil, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { CHARGES_MESSAGES } from '../../messages'
import type { BackendAction } from '@/lib/actions/types'
import { canCancel, canEditCharge, canIssue, canMarkPaid } from '../../utils/chargeUtils'

interface ChargeActionButtonsProps {
  actions: BackendAction[] | null | undefined
  disabled: boolean
  size?: 'sm' | 'md'
  onIssue: () => void
  onMarkPaid: () => void
  onCancel: () => void
  onEdit: () => void
}

export const ChargeActionButtons = ({
  actions,
  disabled,
  size = 'md',
  onIssue,
  onMarkPaid,
  onCancel,
  onEdit,
}: ChargeActionButtonsProps) => (
  <div className="flex flex-wrap items-center gap-2">
    {canEditCharge(actions) && (
      <Button size={size} variant="outline" icon={<Pencil className="h-4 w-4" />} disabled={disabled} onClick={onEdit}>
        {CHARGES_MESSAGES.edit.action}
      </Button>
    )}
    {canIssue(actions) && (
      <Button
        size={size}
        variant="primary"
        icon={<CircleDollarSign className="h-4 w-4" />}
        disabled={disabled}
        onClick={onIssue}
      >
        {CHARGES_MESSAGES.actions.issue}
      </Button>
    )}
    {canMarkPaid(actions) && (
      <Button
        size={size}
        variant="primary"
        icon={<Check className="h-4 w-4" />}
        disabled={disabled}
        onClick={onMarkPaid}
      >
        {CHARGES_MESSAGES.actions.markPaid}
      </Button>
    )}
    {canCancel(actions) && (
      <Button
        size={size}
        variant="outline"
        icon={<XCircle className="h-4 w-4" />}
        disabled={disabled}
        onClick={onCancel}
      >
        {CHARGES_MESSAGES.actions.cancelCharge}
      </Button>
    )}
  </div>
)

ChargeActionButtons.displayName = 'ChargeActionButtons'
