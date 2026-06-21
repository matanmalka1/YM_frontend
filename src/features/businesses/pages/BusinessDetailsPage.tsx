import { type FC } from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import { Alert } from '@/components/ui/overlays/Alert'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { useRole } from '@/hooks/useRole'
import { useBusinessDetails } from '../hooks/useBusinessDetails'
import { BusinessDetailsCard } from '../components/BusinessDetailsCard'
import { BUSINESS_DETAILS_COPY } from '../constants'
import { buildBusinessBreadcrumbs, formatBusinessDisplayName, getBusinessRouteParams } from '../utils/businessUtils'

export const BusinessDetails: FC = () => {
  const { clientId, businessId } = useParams<{
    clientId: string
    businessId: string
  }>()
  const routeParams = getBusinessRouteParams(clientId, businessId)

  const { can } = useRole()
  const { client, business, isLoading, error, isValidId } = useBusinessDetails({
    clientId: routeParams ? Number(routeParams.clientId) : null,
    businessId: routeParams ? Number(routeParams.businessId) : null,
  })

  if (!isValidId) {
    return (
      <PageContent>
        <PageHeader title={BUSINESS_DETAILS_COPY.title} />
        <Alert variant="error" message={BUSINESS_DETAILS_COPY.invalidId} />
      </PageContent>
    )
  }

  const businessDisplayName = formatBusinessDisplayName(business)
  const clientName = client?.full_name ?? BUSINESS_DETAILS_COPY.clientFallback

  return (
    <PageStateGuard
      isLoading={isLoading}
      error={error}
      header={
        <PageHeader
          title={businessDisplayName}
          breadcrumbs={
            routeParams
              ? buildBusinessBreadcrumbs({
                  ...routeParams,
                  clientName,
                  businessName: businessDisplayName,
                })
              : undefined
          }
        />
      }
      loadingMessage={BUSINESS_DETAILS_COPY.loading}
    >
      {business ? <BusinessDetailsCard business={business} client={client} canEdit={can.editClients} /> : null}
    </PageStateGuard>
  )
}
