import { type FC, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BriefcaseBusiness, Edit2, Fingerprint, IdCard } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/overlays/Alert'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { Badge } from '@/components/ui/primitives/Badge'
import { Button } from '@/components/ui/primitives/Button'
import { formatPlainIdentifier } from '@/utils/utils'
import { DOC_TYPE_LABELS, documentsApi, documentsQK } from '@/features/documents'
import { CLIENT_ROUTES } from '../api/endpoints'
import {
  CLIENT_STATUS_BADGE_VARIANTS,
  CLIENT_DETAILS_TAB_LABELS,
  getClientIdNumberTypeLabel,
  getClientStatusLabel,
  getEntityTypeLabel,
  type ActiveClientDetailsTab,
} from '../constants'
import { ClientDetailsTabContent, useClientDetails } from '@/features/clients'
import type { ClientRecordResponse } from '../api'

interface ClientDetailsProps {
  initialTab?: ActiveClientDetailsTab
}

const ClientHeaderMetaItem: FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({
  icon,
  label,
  value,
}) => (
  <span className="inline-flex min-w-[136px] items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-50 text-gray-500">
      {icon}
    </span>
    <span className="min-w-0 text-right leading-tight">
      <span className="block text-[11px] font-semibold text-gray-400">{label}</span>
      <span className="block truncate text-sm font-bold text-gray-900">{value}</span>
    </span>
  </span>
)

const buildClientHeader = (client: ClientRecordResponse) => ({
  title: (
    <span className="flex min-w-0 flex-col gap-3">
      <span className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="truncate">{client.full_name}</span>
        <Badge variant={CLIENT_STATUS_BADGE_VARIANTS[client.status]} size="md">
          {getClientStatusLabel(client.status)}
        </Badge>
      </span>
      <span className="flex min-w-0 flex-wrap items-center gap-2">
        <ClientHeaderMetaItem
          icon={<Fingerprint className="h-4 w-4" />}
          label="ת.ז / ח.פ"
          value={formatPlainIdentifier(client.id_number, 'לא הוגדר')}
        />
        {client.id_number_type && (
          <ClientHeaderMetaItem
            icon={<IdCard className="h-4 w-4" />}
            label="סוג מזהה"
            value={getClientIdNumberTypeLabel(client.id_number_type)}
          />
        )}
        {client.entity_type && (
          <ClientHeaderMetaItem
            icon={<BriefcaseBusiness className="h-4 w-4" />}
            label="סוג ישות"
            value={getEntityTypeLabel(client.entity_type)}
          />
        )}
      </span>
    </span>
  ),
  description: undefined,
})
const ClientHeaderMissingDocuments: FC<{ clientId: number; active: boolean }> = ({ clientId, active }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: documentsQK.clientSignals(clientId),
    queryFn: () => documentsApi.getSignalsByClient(clientId),
    enabled: active && clientId > 0,
    staleTime: 30_000,
    retry: 1,
  })

  if (!active || isLoading || isError) return null

  const missingDocuments = data?.missing_documents ?? []
  if (missingDocuments.length === 0) return null

  const labels = missingDocuments.map((documentType) => DOC_TYPE_LABELS[documentType] ?? documentType)

  return (
    <div className="flex max-w-full items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
        חסרים {missingDocuments.length}
      </span>

      <span className="min-w-0 flex-1 truncate text-amber-900">{labels.join(' · ')}</span>

      <Link
        to={`/clients/${clientId}/documents`}
        className="shrink-0 font-semibold text-amber-900 underline-offset-4 hover:underline"
      >
        מעבר למסמכים
      </Link>
    </div>
  )
}

export const ClientDetails: FC<ClientDetailsProps> = ({ initialTab = 'details' }) => {
  const { clientId } = useParams<{ clientId: string }>()
  const clientIdNum = clientId ? Number(clientId) : null
  const [isEditing, setIsEditing] = useState(false)
  const { client, isValidId, isLoading, error, updateClient, isUpdating, deleteClient, isDeleting, can } =
    useClientDetails({ clientId: clientIdNum })

  useEffect(() => {
    if (initialTab !== 'details') setIsEditing(false)
  }, [initialTab])

  if (!isValidId)
    return (
      <div className="space-y-6">
        <PageHeader title="פרטי לקוח" breadcrumbs={[{ label: 'לקוחות', to: CLIENT_ROUTES.list }]} />
        <Alert variant="error" message="מזהה לקוח לא תקין" />
      </div>
    )

  const clientHeader = client ? buildClientHeader(client) : null
  const breadcrumbs = [
    { label: 'לקוחות', to: CLIENT_ROUTES.list },
    { label: client?.full_name ?? 'פרטי לקוח', to: clientId ? CLIENT_ROUTES.detail(clientId) : CLIENT_ROUTES.list },
    ...(initialTab === 'details'
      ? []
      : [
          {
            label: CLIENT_DETAILS_TAB_LABELS[initialTab],
            to: clientId ? CLIENT_ROUTES.tab(clientId, initialTab) : CLIENT_ROUTES.list,
          },
        ]),
  ]

  return (
    <PageStateGuard
      isLoading={isLoading}
      error={error}
      header={
        <>
          {!can.editClients && <Alert variant="info" message="צפייה בלבד. עריכת פרטי לקוח זמינה ליועצים בלבד." />}
          <PageHeader
            size="md"
            title={clientHeader?.title ?? client?.full_name ?? 'פרטי לקוח'}
            description={
              client && initialTab === 'details' ? (
                <ClientHeaderMissingDocuments clientId={client.id} active />
              ) : undefined
            }
            actions={
              can.editClients && initialTab === 'details' ? (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  ערוך פרטים
                </Button>
              ) : undefined
            }
            breadcrumbs={breadcrumbs}
          />
        </>
      }
      loadingMessage="טוען פרטי לקוח..."
    >
      {client ? (
        <ClientDetailsTabContent
          initialTab={initialTab}
          overviewProps={{
            client,
            clientId: client.id,
            canEditClients: can.editClients,
            updateClient,
            isUpdating,
            deleteClient,
            isDeleting,
            isEditing,
            onEditClose: () => setIsEditing(false),
          }}
        />
      ) : null}
    </PageStateGuard>
  )
}
