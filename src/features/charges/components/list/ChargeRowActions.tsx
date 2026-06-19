import { Bell, CheckCircle2, Eye, FileText, Trash2 } from 'lucide-react'
import { RowActionItem, RowActionSeparator, RowActionsMenu } from '@/components/ui/table'
import { canCancel, canIssue, canMarkPaid } from '../../utils/chargeUtils'
import type { BackendAction } from '@/lib/actions/types'

interface ChargeRowActionsProps {
  chargeId: number
  actions?: BackendAction[] | null
  disabled?: boolean
  showActions?: boolean
  onIssue: () => void
  onMarkPaid: () => void
  onCancel: () => void
  onOpenDetail: () => void
  onSendInvoiceNotification?: () => void
  onSendPaymentReminder?: () => void
}

export const ChargeRowActions: React.FC<ChargeRowActionsProps> = ({
  chargeId,
  actions,
  disabled = false,
  showActions = true,
  onIssue,
  onMarkPaid,
  onCancel,
  onOpenDetail,
  onSendInvoiceNotification,
  onSendPaymentReminder,
}) => {
  const hasActions = showActions && (canIssue(actions) || canMarkPaid(actions) || canCancel(actions))

  return (
    <RowActionsMenu ariaLabel={`פעולות לחיוב ${chargeId}`}>
      <RowActionItem
        label="צפייה בפרטים"
        onClick={onOpenDetail}
        icon={<Eye className="h-4 w-4" />}
        disabled={disabled}
      />
      {(onSendInvoiceNotification || onSendPaymentReminder) && <RowActionSeparator />}
      {onSendInvoiceNotification && (
        <RowActionItem
          label="שלח הודעת חשבונית"
          onClick={onSendInvoiceNotification}
          icon={<Bell className="h-4 w-4" />}
          disabled={disabled}
        />
      )}
      {onSendPaymentReminder && (
        <RowActionItem
          label="שלח תזכורת לתשלום"
          onClick={onSendPaymentReminder}
          icon={<Bell className="h-4 w-4" />}
          disabled={disabled}
        />
      )}
      {hasActions && <RowActionSeparator />}
      {showActions && canIssue(actions) && (
        <RowActionItem label="הנפקה" onClick={onIssue} icon={<FileText className="h-4 w-4" />} disabled={disabled} />
      )}
      {showActions && canMarkPaid(actions) && (
        <RowActionItem
          label="סימון שולם"
          onClick={onMarkPaid}
          icon={<CheckCircle2 className="h-4 w-4" />}
          disabled={disabled}
        />
      )}
      {showActions && canCancel(actions) && (
        <RowActionItem
          label="ביטול"
          onClick={onCancel}
          icon={<Trash2 className="h-4 w-4" />}
          danger
          disabled={disabled}
        />
      )}
    </RowActionsMenu>
  )
}

ChargeRowActions.displayName = 'ChargeRowActions'
