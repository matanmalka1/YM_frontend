import { GLOBAL_UI_MESSAGES } from '@/messages'
import { type FC } from 'react'
import { Link } from 'react-router-dom'
import { BriefcaseBusiness, Edit2, Fingerprint, IdCard } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import { Alert } from '@/components/ui/overlays/Alert'
import { AlertBanner } from '@/components/ui/overlays/AlertBanner'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { MetaItem, MetaStrip } from '@/components/ui/layout'
import { Badge } from '@/components/ui/primitives/Badge'
import { Button } from '@/components/ui/primitives/Button'
import { formatPlainIdentifier } from '@/utils/utils'
import { CLIENT_ROUTES } from '../api/endpoints'
import {
  CLIENT_DETAILS_TAB_LABELS,
  getClientStatusBadgeVariant,
  getClientIdNumberTypeLabel,
  getClientStatusLabel,
  getEntityTypeLabel,
  type ActiveClientDetailsTab,
} from '../constants'
import { ClientDetailsTabContent } from '../components/detail/ClientDetailsTabContent'
import { useClientDetailsPage } from '../hooks/useClientDetailsPage'
import type { ClientRecordResponse } from '../api'
import { CLIENTS_MESSAGES } from '../messages'
import { CLIENTS_ERROR_MESSAGES } from '../errorMessages'

interface ClientDetailsProps {
  initialTab?: ActiveClientDetailsTab
}

const buildClientTitle = (client: ClientRecordResponse) => (
  <span className="flex min-w-0 flex-wrap items-center gap-2">
    <span className="truncate">{client.full_name}</span>
    <Badge variant={getClientStatusBadgeVariant(client.status)} size="md">
      {getClientStatusLabel(client.status)}
    </Badge>
  </span>
)

const ClientHeaderMeta: FC<{ client: ClientRecordResponse }> = ({ client }) => (
  <MetaStrip>
    <MetaItem icon={<Fingerprint className="h-4 w-4" />} label={CLIENTS_MESSAGES.details.metaIdNumber}>
      {formatPlainIdentifier(client.id_number, CLIENTS_MESSAGES.details.notDefined)}
    </MetaItem>
    {client.id_number_type && (
      <MetaItem icon={<IdCard className="h-4 w-4" />} label={CLIENTS_MESSAGES.details.metaIdNumberType}>
        {getClientIdNumberTypeLabel(client.id_number_type)}
      </MetaItem>
    )}
    {client.entity_type && (
      <MetaItem icon={<BriefcaseBusiness className="h-4 w-4" />} label={CLIENTS_MESSAGES.details.metaEntityType}>
        {getEntityTypeLabel(client.entity_type)}
      </MetaItem>
    )}
  </MetaStrip>
)
const ClientHeaderMissingDocuments: FC<{
  clientId: number
  labels: string[]
  count: number
  error: string | null
}> = ({ clientId, labels, count, error }) => {
  if (error) return <AlertBanner tone="negative">{error}</AlertBanner>
  if (count === 0) return null
  return (
    <AlertBanner tone="warning">
      <span className="flex min-w-0 items-center gap-2">
        <Badge variant="warning" size="xs" className="shrink-0">
          {CLIENTS_MESSAGES.details.missingCount(count)}
        </Badge>
        <span className="min-w-0 flex-1 truncate">{labels.join(' · ')}</span>
        <Link to={CLIENT_ROUTES.documents(clientId)} className="shrink-0 font-semibold underline-offset-4 hover:underline">
          {CLIENTS_MESSAGES.details.goToDocuments}
        </Link>
      </span>
    </AlertBanner>
  )
}

export const ClientDetails: FC<ClientDetailsProps> = ({ initialTab = 'details' }) => {
  const page = useClientDetailsPage(initialTab)
  const { client, isValidId, isLoading, error, can } = page

  if (!isValidId)
    return (
      <PageContent>
        <PageHeader
          title={CLIENTS_MESSAGES.details.pageTitle}
          breadcrumbs={[{ label: GLOBAL_UI_MESSAGES.common.clients, to: CLIENT_ROUTES.list }]}
        />
        <Alert variant="error" message={CLIENTS_ERROR_MESSAGES.details.invalidId} />
      </PageContent>
    )

  const breadcrumbs = [
    { label: GLOBAL_UI_MESSAGES.common.clients, to: CLIENT_ROUTES.list },
    {
      label: client?.full_name ?? CLIENTS_MESSAGES.details.pageTitle,
      to: page.routeClientId ? CLIENT_ROUTES.detail(page.routeClientId) : CLIENT_ROUTES.list,
    },
    ...(initialTab === 'details'
      ? []
      : [
          {
            label: CLIENT_DETAILS_TAB_LABELS[initialTab],
            to: page.routeClientId ? CLIENT_ROUTES.tab(page.routeClientId, initialTab) : CLIENT_ROUTES.list,
          },
        ]),
  ]

  return (
    <PageStateGuard
      isLoading={isLoading}
      error={error}
      header={
        <>
          {!can.editClients && <Alert variant="info" message={CLIENTS_MESSAGES.details.viewOnlyNotice} />}
          <div className="space-y-3">
            <PageHeader
              size="md"
              title={client ? buildClientTitle(client) : CLIENTS_MESSAGES.details.pageTitle}
              description={
                client && initialTab === 'details' && !page.documentSignals.isLoading ? (
                  <ClientHeaderMissingDocuments
                    clientId={client.id}
                    labels={page.documentSignals.labels}
                    count={page.documentSignals.missingDocuments.length}
                    error={page.documentSignals.error}
                  />
                ) : undefined
              }
              actions={
                can.editClients && initialTab === 'details' ? (
                  <Button variant="primary" size="sm" icon={<Edit2 className="h-4 w-4" />} onClick={page.requestEdit}>
                    {CLIENTS_MESSAGES.details.editDetails}
                  </Button>
                ) : undefined
              }
              breadcrumbs={breadcrumbs}
            />
            {client && <ClientHeaderMeta client={client} />}
          </div>
        </>
      }
      loadingMessage={CLIENTS_MESSAGES.details.loadingMessage}
    >
      {client ? (
        <ClientDetailsTabContent
          initialTab={initialTab}
          overviewProps={{
            client,
            clientId: client.id,
            canEditClients: can.editClients,
            canManageSignatureRequests: can.manageSignatureRequests,
            updateClient: page.updateClient,
            isUpdating: page.isUpdating,
            deleteClient: page.deleteClient,
            isDeleting: page.isDeleting,
            isEditing: page.isEditing,
            onEditClose: page.closeEdit,
          }}
        />
      ) : null}
    </PageStateGuard>
  )
}
