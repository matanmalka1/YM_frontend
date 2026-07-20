import { Navigate, useParams } from 'react-router-dom'
import { PageContent } from '@/components/layout/PageContent'
import { VatWorkItemFullPanel } from '@/features/vatReports'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { isPositiveInt } from '@/utils/utils'
import { CLIENT_ROUTES } from '../api/endpoints'
import { CLIENT_DETAILS_TAB_LABELS } from '../constants'
import { useClientQuery } from '../hooks/useClientQuery'
import { CLIENTS_MESSAGES } from '../messages'

export const ClientVatWorkItemDetail = () => {
  const { clientId, workItemId } = useParams<{ clientId: string; workItemId: string }>()
  const clientIdNumber = Number(clientId)
  const workItemIdNumber = Number(workItemId)
  const { client, isValidId } = useClientQuery({ clientId: clientIdNumber })

  if (!isValidId || !isPositiveInt(workItemIdNumber)) {
    return <Navigate to={clientId ? CLIENT_ROUTES.vat(clientId) : CLIENT_ROUTES.list} replace />
  }

  const clientName = client?.full_name ?? CLIENTS_MESSAGES.details.pageTitle
  const vatPath = CLIENT_ROUTES.vat(clientIdNumber)

  return (
    <PageContent>
      <VatWorkItemFullPanel
        workItemId={workItemIdNumber}
        leadingBreadcrumbs={[
          { label: GLOBAL_UI_MESSAGES.common.clients, to: CLIENT_ROUTES.list },
          { label: clientName, to: CLIENT_ROUTES.detail(clientIdNumber) },
          { label: CLIENT_DETAILS_TAB_LABELS.vat, to: vatPath },
        ]}
      />
    </PageContent>
  )
}

ClientVatWorkItemDetail.displayName = 'ClientVatWorkItemDetail'
