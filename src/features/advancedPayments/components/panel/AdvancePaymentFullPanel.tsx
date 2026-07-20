import type { Breadcrumb } from '@/components/layout/PageHeader'
import { PageLoading } from '@/components/ui/layout/PageLoading'
import { Alert } from '@/components/ui/overlays/Alert'
import { useAdvancePaymentDetailPage } from '../../hooks/useAdvancePaymentDetailPage'
import { AdvancePaymentDetailView } from './AdvancePaymentDetailView'

interface AdvancePaymentFullPanelProps {
  clientRecordId: number
  paymentId: number
  clientName?: string | null
  clientIdNumber?: string | null
  officeClientNumber?: number | null
  /** Where a delete returns to; also the client-tab breadcrumb target. */
  backPath: string
  /** Breadcrumbs rendered before the payment crumb (לקוחות › client › מקדמות). */
  leadingBreadcrumbs: Breadcrumb[]
}

export const AdvancePaymentFullPanel: React.FC<AdvancePaymentFullPanelProps> = ({
  clientRecordId,
  paymentId,
  clientName,
  clientIdNumber,
  officeClientNumber,
  backPath,
  leadingBreadcrumbs,
}) => {
  const { status, headerProps, permissions, payment, actions, turnoverRefresh } = useAdvancePaymentDetailPage({
    clientRecordId,
    paymentId,
    clientName,
    officeClientNumber,
    backPath,
    leadingBreadcrumbs,
  })

  if (status.isLoading) return <PageLoading />
  if (status.error || !payment) return <Alert variant="error" message={status.error ?? ''} />

  return (
    <AdvancePaymentDetailView
      key={payment.id}
      payment={payment}
      title={headerProps.title}
      description={headerProps.description}
      breadcrumbs={headerProps.breadcrumbs}
      clientIdNumber={clientIdNumber}
      canEdit={permissions.canEdit}
      isUpdating={actions.isUpdating}
      isDeleting={actions.isDeleting}
      onSave={actions.onSave}
      onDelete={actions.onDelete}
      turnoverRefresh={turnoverRefresh}
    />
  )
}

AdvancePaymentFullPanel.displayName = 'AdvancePaymentFullPanel'
