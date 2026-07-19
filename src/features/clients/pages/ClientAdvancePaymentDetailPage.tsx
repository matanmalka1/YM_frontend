import { type FC } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { PageContent } from '@/components/layout/PageContent'
import { AdvancePaymentFullPanel } from '@/features/advancedPayments'
import { isPositiveInt } from '@/utils/utils'
import { CLIENT_ROUTES } from '../api/endpoints'
import { CLIENT_DETAILS_TAB_LABELS } from '../constants'
import { useClientQuery } from '../hooks/useClientQuery'
import { CLIENTS_MESSAGES } from '../messages'

/**
 * A single advance payment opened from within a client's "advance-payments" tab.
 * Lives under /clients/:clientId/advance-payments/:paymentId so the top nav keeps
 * לקוחות highlighted and the breadcrumb shows the full client-scoped chain.
 * The panel owns its own loading/error/header, so this page only resolves the
 * client identity used by the breadcrumb and the payment context strip.
 */
export const ClientAdvancePaymentDetail: FC = () => {
  const { clientId, paymentId } = useParams<{ clientId: string; paymentId: string }>()
  const clientIdNum = clientId ? Number(clientId) : null
  const paymentIdNum = Number(paymentId)
  const { client, isValidId } = useClientQuery({ clientId: clientIdNum })

  if (!paymentId || !isPositiveInt(paymentIdNum) || !isValidId) {
    return <Navigate to={clientId ? CLIENT_ROUTES.advancePayments(clientId) : CLIENT_ROUTES.list} replace />
  }

  const clientName = client?.full_name ?? CLIENTS_MESSAGES.details.pageTitle

  return (
    <PageContent>
      <AdvancePaymentFullPanel
        clientRecordId={clientIdNum!}
        paymentId={paymentIdNum}
        clientName={client?.full_name ?? null}
        clientIdNumber={client?.id_number ?? null}
        officeClientNumber={client?.office_client_number ?? null}
        backPath={CLIENT_ROUTES.advancePayments(clientId!)}
        leadingBreadcrumbs={[
          { label: GLOBAL_UI_MESSAGES.common.clients, to: CLIENT_ROUTES.list },
          { label: clientName, to: CLIENT_ROUTES.detail(clientId!) },
          { label: CLIENT_DETAILS_TAB_LABELS['advance-payments'], to: CLIENT_ROUTES.advancePayments(clientId!) },
        ]}
      />
    </PageContent>
  )
}

ClientAdvancePaymentDetail.displayName = 'ClientAdvancePaymentDetail'
