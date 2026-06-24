import { Button } from '@/components/ui/primitives/Button'
import type { BinderResponse } from '../../types'
import { hasBinderAction } from '../../utils'
import { BINDERS_MESSAGES } from '../../messages'

interface BinderActionButtonsProps {
  binder: BinderResponse
  disabled?: boolean
  onReceiveMaterial?: React.MouseEventHandler<HTMLButtonElement>
  onMarkFull?: React.MouseEventHandler<HTMLButtonElement>
  onReopenCapacity?: React.MouseEventHandler<HTMLButtonElement>
  onMarkReadyForHandover: React.MouseEventHandler<HTMLButtonElement>
  onMarkReadyForHandoverBulk?: React.MouseEventHandler<HTMLButtonElement>
  onRevertReadyForHandover?: React.MouseEventHandler<HTMLButtonElement>
  onHandoverToClient?: React.MouseEventHandler<HTMLButtonElement>
  onHandoverToClientBulk?: React.MouseEventHandler<HTMLButtonElement>
  size?: 'sm' | 'inline'
}

export const BinderActionButtons: React.FC<BinderActionButtonsProps> = ({
  binder,
  disabled = false,
  onReceiveMaterial,
  onMarkFull,
  onReopenCapacity,
  onMarkReadyForHandover,
  onMarkReadyForHandoverBulk,
  onRevertReadyForHandover,
  onHandoverToClient,
  onHandoverToClientBulk,
  size = 'inline',
}) => {
  const gap = size === 'sm' ? 'flex flex-wrap gap-2 py-2' : 'flex flex-wrap items-center gap-1.5'

  return (
    <div className={gap}>
      {hasBinderAction(binder, 'receive_material') && onReceiveMaterial && (
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onReceiveMaterial}>
          {BINDERS_MESSAGES.actions.receiveMaterial}
        </Button>
      )}
      {hasBinderAction(binder, 'mark_full') && onMarkFull && (
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onMarkFull}>
          {BINDERS_MESSAGES.actions.markFull}
        </Button>
      )}
      {hasBinderAction(binder, 'reopen_capacity') && onReopenCapacity && (
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onReopenCapacity}>
          {BINDERS_MESSAGES.actions.reopenCapacity}
        </Button>
      )}
      {hasBinderAction(binder, 'mark_ready_for_handover') && (
        <>
          <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onMarkReadyForHandover}>
            {BINDERS_MESSAGES.actions.readyForHandover}
          </Button>
          {onMarkReadyForHandoverBulk && (
            <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onMarkReadyForHandoverBulk}>
              {BINDERS_MESSAGES.actions.bulkReadyForHandover}
            </Button>
          )}
        </>
      )}
      {hasBinderAction(binder, 'revert_ready_for_handover') && (
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onRevertReadyForHandover}>
          {BINDERS_MESSAGES.actions.revertReadyForHandover}
        </Button>
      )}
      {hasBinderAction(binder, 'handover_to_client') && (
        <>
          <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onHandoverToClient}>
            {BINDERS_MESSAGES.actions.handoverToClient}
          </Button>
          {onHandoverToClientBulk && (
            <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onHandoverToClientBulk}>
              {BINDERS_MESSAGES.actions.bulkHandoverToClient}
            </Button>
          )}
        </>
      )}
    </div>
  )
}

BinderActionButtons.displayName = 'BinderActionButtons'
