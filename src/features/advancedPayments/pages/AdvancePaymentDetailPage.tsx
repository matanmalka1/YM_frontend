import { Navigate, useLocation, useParams } from 'react-router-dom'
import { PageContent } from '@/components/layout/PageContent'
import { isPositiveInt } from '@/utils/utils'
import { AdvancePaymentFullPanel } from '../components/panel/AdvancePaymentFullPanel'
import { ADVANCED_PAYMENTS_MESSAGES } from '../messages'

interface AdvancePaymentNavigationState {
  clientName?: string
  idNumber?: string | null
  officeClientNumber?: number | null
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const getNavigationState = (state: unknown): AdvancePaymentNavigationState => {
  if (!isRecord(state)) return {}

  return {
    ...(typeof state.clientName === 'string' ? { clientName: state.clientName } : {}),
    ...(typeof state.idNumber === 'string' || state.idNumber === null ? { idNumber: state.idNumber } : {}),
    ...(typeof state.officeClientNumber === 'number' || state.officeClientNumber === null
      ? { officeClientNumber: state.officeClientNumber }
      : {}),
  }
}

export const AdvancePaymentDetail = () => {
  const { clientId, paymentId } = useParams<{ clientId: string; paymentId: string }>()
  const location = useLocation()
  const clientRecordId = Number(clientId)
  const paymentIdNumber = Number(paymentId)
  const backPath = `/tax/advance-payments${location.search}`

  if (!isPositiveInt(clientRecordId) || !isPositiveInt(paymentIdNumber)) {
    return <Navigate to={backPath} replace />
  }

  const navigationState = getNavigationState(location.state)

  return (
    <PageContent>
      <AdvancePaymentFullPanel
        clientRecordId={clientRecordId}
        paymentId={paymentIdNumber}
        clientName={navigationState.clientName}
        clientIdNumber={navigationState.idNumber}
        officeClientNumber={navigationState.officeClientNumber}
        backPath={backPath}
        leadingBreadcrumbs={[{ label: ADVANCED_PAYMENTS_MESSAGES.clientTab.paginationLabel, to: backPath }]}
      />
    </PageContent>
  )
}

AdvancePaymentDetail.displayName = 'AdvancePaymentDetail'
