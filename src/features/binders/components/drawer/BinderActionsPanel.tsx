import type { BinderResponse } from '../../types'
import { BinderActionButtons } from './BinderActionButtons'

interface BinderActionsPanelProps {
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
}

export const BinderActionsPanel: React.FC<BinderActionsPanelProps> = ({
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
}) => (
  <div className="flex items-center gap-2 pt-2">
    <BinderActionButtons
      binder={binder}
      disabled={disabled}
      onReceiveMaterial={onReceiveMaterial}
      onMarkFull={onMarkFull}
      onReopenCapacity={onReopenCapacity}
      onMarkReadyForHandover={onMarkReadyForHandover}
      onMarkReadyForHandoverBulk={onMarkReadyForHandoverBulk}
      onRevertReadyForHandover={onRevertReadyForHandover}
      onHandoverToClient={onHandoverToClient}
      onHandoverToClientBulk={onHandoverToClientBulk}
      size="sm"
    />
  </div>
)

BinderActionsPanel.displayName = 'BinderActionsPanel'
