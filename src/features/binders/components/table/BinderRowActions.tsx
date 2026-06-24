import { ArrowLeft, CheckCircle2, ClipboardCheck, Eye, ListChecks, Lock, RotateCcw, Trash2, Unlock } from 'lucide-react'
import { RowActionItem, RowActionSeparator, RowActionsMenu } from '@/components/ui/table'
import { hasBinderAction } from '../../utils'
import type { BinderResponse } from '../../types'
import { BINDERS_MESSAGES } from '../../messages'

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
    <RowActionsMenu ariaLabel={BINDERS_MESSAGES.rowActions.ariaLabel(binder.id)}>
      <RowActionItem
        label={BINDERS_MESSAGES.actions.viewDetails}
        onClick={onOpenDetail}
        icon={<Eye className="h-4 w-4" />}
        disabled={disabled}
      />
      {hasActions && <RowActionSeparator />}
      {canReceiveMaterial && (
        <RowActionItem
          label={BINDERS_MESSAGES.actions.receiveMaterial}
          onClick={onReceiveMaterial}
          icon={<ClipboardCheck className="h-4 w-4" />}
          disabled={disabled}
        />
      )}
      {canMarkFull && (
        <RowActionItem
          label={BINDERS_MESSAGES.actions.markFull}
          onClick={onMarkFull}
          icon={<Lock className="h-4 w-4" />}
          disabled={disabled}
        />
      )}
      {canReopenCapacity && (
        <RowActionItem
          label={BINDERS_MESSAGES.actions.reopenCapacity}
          onClick={onReopenCapacity}
          icon={<Unlock className="h-4 w-4" />}
          disabled={disabled}
        />
      )}
      {canMarkReady && (
        <>
          <RowActionItem
            label={BINDERS_MESSAGES.actions.readyForHandover}
            onClick={onMarkReadyForHandover}
            icon={<CheckCircle2 className="h-4 w-4" />}
            disabled={disabled}
          />
          <RowActionItem
            label={BINDERS_MESSAGES.actions.bulkReadyForHandover}
            onClick={onMarkReadyForHandoverBulk}
            icon={<ListChecks className="h-4 w-4" />}
            disabled={disabled}
          />
        </>
      )}
      {canRevertReady && (
        <RowActionItem
          label={BINDERS_MESSAGES.actions.revertReadyForHandover}
          onClick={onRevertReadyForHandover}
          icon={<RotateCcw className="h-4 w-4" />}
          disabled={disabled}
        />
      )}
      {canHandover && (
        <>
          <RowActionItem
            label={BINDERS_MESSAGES.actions.handoverToClient}
            onClick={onHandoverToClient}
            icon={<ArrowLeft className="h-4 w-4" />}
            disabled={disabled}
          />
          <RowActionItem
            label={BINDERS_MESSAGES.actions.bulkHandoverToClient}
            onClick={onHandoverToClientBulk}
            icon={<ListChecks className="h-4 w-4" />}
            disabled={disabled}
          />
        </>
      )}
      <RowActionSeparator />
      <RowActionItem
        label={BINDERS_MESSAGES.actions.deleteBinder}
        onClick={onDelete}
        icon={<Trash2 className="h-4 w-4" />}
        danger
        disabled={disabled}
      />
    </RowActionsMenu>
  )
}

BinderRowActions.displayName = 'BinderRowActions'
