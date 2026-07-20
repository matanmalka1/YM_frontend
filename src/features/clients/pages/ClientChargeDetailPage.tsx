import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { PageContent } from '@/components/layout/PageContent'
import { ChargeDetailPanel } from '@/features/charges'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { isPositiveInt } from '@/utils/utils'
import { CLIENT_ROUTES } from '../api/endpoints'
import { CLIENT_DETAILS_TAB_LABELS } from '../constants'
import { useClientQuery } from '../hooks/useClientQuery'
import { CLIENTS_MESSAGES } from '../messages'

export const ClientChargeDetail = () => {
  const { clientId, chargeId } = useParams<{ clientId: string; chargeId: string }>()
  const navigate = useNavigate()
  const clientIdNumber = Number(clientId)
  const chargeIdNumber = Number(chargeId)
  const { client, isValidId } = useClientQuery({ clientId: clientIdNumber })

  if (!isValidId || !isPositiveInt(chargeIdNumber)) {
    return <Navigate to={clientId ? CLIENT_ROUTES.charges(clientId) : CLIENT_ROUTES.list} replace />
  }

  const backPath = CLIENT_ROUTES.charges(clientIdNumber)

  return (
    <PageContent>
      <ChargeDetailPanel
        chargeId={chargeIdNumber}
        leadingBreadcrumbs={[
          { label: GLOBAL_UI_MESSAGES.common.clients, to: CLIENT_ROUTES.list },
          { label: client?.full_name ?? CLIENTS_MESSAGES.details.pageTitle, to: CLIENT_ROUTES.detail(clientIdNumber) },
          { label: CLIENT_DETAILS_TAB_LABELS.charges, to: backPath },
        ]}
        onDeleted={() => navigate(backPath, { replace: true })}
      />
    </PageContent>
  )
}

ClientChargeDetail.displayName = 'ClientChargeDetail'
