import { Trash2 } from 'lucide-react'
import { DetailDrawer } from '@/components/ui/overlays/DetailDrawer'
import { Button } from '@/components/ui/primitives/Button'
import type { BinderResponse } from '../../types'
import { BinderActionsPanel } from './BinderActionsPanel'
import { BinderDetailsPanel } from './BinderDetailsPanel'
import { BinderHistorySection } from '../sections/BinderHistorySection'
import { BinderIntakesSection } from '../sections/BinderIntakesSection'

interface BinderDetailDrawerProps {
  open: boolean
  binder: BinderResponse | null
  onClose: () => void
  onReceiveMaterial?: () => void
  onMarkFull?: () => void
  onReopenCapacity?: () => void
  onMarkReadyForHandover?: () => void
  onMarkReadyForHandoverBulk?: () => void
  onRevertReadyForHandover?: () => void
  onHandoverToClient?: () => void
  onHandoverToClientBulk?: () => void
  onDelete?: () => void
  actionLoading?: boolean
}

export const BinderDetailDrawer: React.FC<BinderDetailDrawerProps> = ({
  open,
  binder,
  onClose,
  onReceiveMaterial,
  onMarkFull,
  onReopenCapacity,
  onMarkReadyForHandover,
  onMarkReadyForHandoverBulk,
  onRevertReadyForHandover,
  onHandoverToClient,
  onHandoverToClientBulk,
  onDelete,
  actionLoading = false,
}) => (
  <DetailDrawer
    open={open}
    title={binder ? `קלסר ${binder.binder_number}` : ''}
    onClose={onClose}
    footer={
      binder && onDelete ? (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 ml-1" />
            מחק קלסר
          </Button>
        </div>
      ) : undefined
    }
  >
    {!binder && <div className="flex items-center justify-center py-12 text-sm text-gray-400">טוען...</div>}
    {binder && (
      <>
        <BinderDetailsPanel binder={binder} />
        <BinderActionsPanel
          binder={binder}
          disabled={actionLoading}
          onReceiveMaterial={onReceiveMaterial}
          onMarkFull={onMarkFull}
          onReopenCapacity={onReopenCapacity}
          onMarkReadyForHandover={onMarkReadyForHandover ?? (() => undefined)}
          onMarkReadyForHandoverBulk={onMarkReadyForHandoverBulk}
          onRevertReadyForHandover={onRevertReadyForHandover}
          onHandoverToClient={onHandoverToClient}
          onHandoverToClientBulk={onHandoverToClientBulk}
        />
        <BinderIntakesSection
          binderId={binder.id}
          clientId={binder.client_record_id}
          onNavigateToAnnualReport={onClose}
        />
        <BinderHistorySection binderId={binder.id} />
      </>
    )}
  </DetailDrawer>
)

BinderDetailDrawer.displayName = 'BinderDetailDrawer'
