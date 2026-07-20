import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { PageContent } from '@/components/layout/PageContent'
import { isPositiveInt } from '@/utils/utils'
import { CHARGE_ROUTES } from '../api/endpoints'
import { ChargeDetailPanel } from '../components/detail/ChargeDetailPanel'
import { CHARGES_MESSAGES } from '../messages'

export const ChargeDetail = () => {
  const { chargeId } = useParams<{ chargeId: string }>()
  const navigate = useNavigate()
  const id = Number(chargeId)

  if (!isPositiveInt(id)) return <Navigate to={CHARGE_ROUTES.list} replace />

  return (
    <PageContent>
      <ChargeDetailPanel
        chargeId={id}
        leadingBreadcrumbs={[{ label: CHARGES_MESSAGES.list.title, to: CHARGE_ROUTES.list }]}
        onDeleted={() => navigate(CHARGE_ROUTES.list, { replace: true })}
      />
    </PageContent>
  )
}

ChargeDetail.displayName = 'ChargeDetail'
