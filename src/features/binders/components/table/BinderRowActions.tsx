import { ArrowLeft, CheckCircle2, ClipboardCheck, Eye, ListChecks, Lock, RotateCcw, Trash2, Unlock } from 'lucide-react'
import { RowActionItem, RowActionSeparator, RowActionsMenu } from '@/components/ui/table'
import { hasBinderAction } from '../../utils'
import type { BinderResponse } from '../../types'

interface BinderRowActionsProps {
  binder: BinderResponse
  disabled?: boolean
  onOpenDetail: () => void
  onReceiveMaterial: () => void
  onMarkFull: () => void
  onReopenCapacity: () => void
  onMarkReadyForHandover: () => void
  onMarkReadyForHandoverBulk: () => void
  onRevertReadyForHandover: () => void
  onHandoverToClient: () => void
  onHandoverToClientBulk: () => void
  onDelete: () => void
}

export const BinderRowActions: React.FC<BinderRowActionsProps> = ({
  binder,
  disabled = false,
  onOpenDetail,
  onReceiveMaterial,
  onMarkFull,
  onReopenCapacity,
  onMarkReadyForHandover,
  onMarkReadyForHandoverBulk,
  onRevertReadyForHandover,
  onHandoverToClient,
  onHandoverToClientBulk,
  onDelete,
}) => {
  const canReceiveMaterial = hasBinderAction(binder, 'receive_material')
  const canMarkFull = hasBinderAction(binder, 'mark_full')
  const canReopenCapacity = hasBinderAction(binder, 'reopen_capacity')
  const canMarkReady = hasBinderAction(binder, 'mark_ready_for_handover')
  const canRevertReady = hasBinderAction(binder, 'revert_ready_for_handover')
  const canHandover = hasBinderAction(binder, 'handover_to_client')
  const hasActions =
    canReceiveMaterial || canMarkFull || canReopenCapacity || canMarkReady || canRevertReady || canHandover

  return (
    <RowActionsMenu ariaLabel={`פעולות לקלסר ${binder.id}`}>
      <RowActionItem
        label="צפייה בפרטים"
        onClick={onOpenDetail}
        icon={<Eye className="h-4 w-4" />}
        disabled={disabled}
      />
      {hasActions && <RowActionSeparator />}
      {canReceiveMaterial && (
        <RowActionItem
          label="רשום קליטת חומר"
          onClick={onReceiveMaterial}
          icon={<ClipboardCheck className="h-4 w-4" />}
          disabled={disabled}
        />
      )}
      {canMarkFull && (
        <RowActionItem label="סמן כמלא" onClick={onMarkFull} icon={<Lock className="h-4 w-4" />} disabled={disabled} />
      )}
      {canReopenCapacity && (
        <RowActionItem
          label="פתח קיבולת"
          onClick={onReopenCapacity}
          icon={<Unlock className="h-4 w-4" />}
          disabled={disabled}
        />
      )}
      {canMarkReady && (
        <>
          <RowActionItem
            label="מוכן למסירה"
            onClick={onMarkReadyForHandover}
            icon={<CheckCircle2 className="h-4 w-4" />}
            disabled={disabled}
          />
          <RowActionItem
            label="סימון קבוצתי למסירה"
            onClick={onMarkReadyForHandoverBulk}
            icon={<ListChecks className="h-4 w-4" />}
            disabled={disabled}
          />
        </>
      )}
      {canRevertReady && (
        <RowActionItem
          label="בטל מוכן למסירה"
          onClick={onRevertReadyForHandover}
          icon={<RotateCcw className="h-4 w-4" />}
          disabled={disabled}
        />
      )}
      {canHandover && (
        <>
          <RowActionItem
            label="מסירה ללקוח"
            onClick={onHandoverToClient}
            icon={<ArrowLeft className="h-4 w-4" />}
            disabled={disabled}
          />
          <RowActionItem
            label="מסירה קבוצתית"
            onClick={onHandoverToClientBulk}
            icon={<ListChecks className="h-4 w-4" />}
            disabled={disabled}
          />
        </>
      )}
      <RowActionSeparator />
      <RowActionItem
        label="מחק קלסר"
        onClick={onDelete}
        icon={<Trash2 className="h-4 w-4" />}
        danger
        disabled={disabled}
      />
    </RowActionsMenu>
  )
}

BinderRowActions.displayName = 'BinderRowActions'
