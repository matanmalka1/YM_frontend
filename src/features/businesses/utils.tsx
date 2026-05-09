import { Link } from 'react-router-dom'
import type { Breadcrumb } from '@/components/layout/PageHeader'
import type { DefinitionItem } from '@/components/ui/layout/DefinitionList'
import { CLIENT_ROUTES, type BusinessResponse, type ClientRecordResponse } from '@/features/clients'
import { formatClientOfficeId, formatDate } from '@/utils/utils'
import { BUSINESS_DETAILS_COPY, getBusinessStatusLabel } from './constants'

type BusinessRouteParams = {
  clientId: string
  businessId: string
}

export const formatBusinessDisplayName = (business: Pick<BusinessResponse, 'business_name'> | null) =>
  business?.business_name ?? BUSINESS_DETAILS_COPY.title

export const getBusinessRouteParams = (
  clientId: string | undefined,
  businessId: string | undefined,
): BusinessRouteParams | null => {
  if (!clientId || !businessId) {
    return null
  }

  return { clientId, businessId }
}

export const buildBusinessBreadcrumbs = ({
  clientId,
  businessId,
  clientName,
  businessName,
}: BusinessRouteParams & {
  clientName: string
  businessName: string
}): Breadcrumb[] => [
  { label: BUSINESS_DETAILS_COPY.clientsListLabel, to: CLIENT_ROUTES.list },
  { label: clientName, to: CLIENT_ROUTES.detail(clientId) },
  {
    label: businessName,
    to: CLIENT_ROUTES.businessDetail(clientId, businessId),
  },
]

export const buildBusinessSummaryItems = (
  business: BusinessResponse,
  client: ClientRecordResponse | null,
): DefinitionItem[] => [
  {
    label: BUSINESS_DETAILS_COPY.systemIdLabel,
    value: formatClientOfficeId(business.id),
  },
  {
    label: BUSINESS_DETAILS_COPY.clientLabel,
    value: client ? (
      <Link to={CLIENT_ROUTES.detail(client.id)} className="text-primary-600 hover:underline">
        {client.full_name}
      </Link>
    ) : (
      BUSINESS_DETAILS_COPY.emptyValue
    ),
  },
  {
    label: BUSINESS_DETAILS_COPY.businessNameLabel,
    value: business.business_name ?? BUSINESS_DETAILS_COPY.emptyValue,
  },
  {
    label: BUSINESS_DETAILS_COPY.statusLabel,
    value: getBusinessStatusLabel(business.status),
  },
  {
    label: BUSINESS_DETAILS_COPY.openedAtLabel,
    value: formatDate(business.opened_at),
  },
  {
    label: BUSINESS_DETAILS_COPY.closedAtLabel,
    value: formatDate(business.closed_at),
  },
  {
    label: BUSINESS_DETAILS_COPY.createdAtLabel,
    value: formatDate(business.created_at),
  },
]
