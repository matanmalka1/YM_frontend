import { useQuery } from '@tanstack/react-query'
import { signatureRequestsApi, signatureRequestsQK } from '../../api'
import { DetailDrawer } from '../../../../components/ui/overlays/DetailDrawer'
import { DefinitionList } from '../../../../components/ui/layout/DefinitionList'
import { DrawerSection } from '../../../../components/ui/overlays/DrawerPrimitives'
import { SkeletonBlock } from '../../../../components/ui/primitives/SkeletonBlock'
import { Timeline, TimelineEntry } from '@/components/ui/feedback/Timeline'
import { StatusBadge } from '../../../../components/ui/primitives/StatusBadge'
import { formatDate, formatDateTime, formatPhoneNumber } from '../../../../utils/utils'
import {
  SIGNATURE_REQUEST_ACTOR_TYPE_LABELS,
  SIGNATURE_REQUEST_EVENT_TYPE_LABELS,
  getSignatureRequestTypeLabel,
  getSignatureRequestStatusLabel,
} from '../../constants'
import { signatureRequestStatusVariants } from '../../utils'
import { SIGNATURE_REQUESTS_MESSAGES } from '../../messages'

interface Props {
  requestId: number | null
  onClose: () => void
}

export const SignatureRequestAuditDrawer: React.FC<Props> = ({ requestId, onClose }) => {
  const open = requestId != null

  const { data, isLoading } = useQuery({
    queryKey: signatureRequestsQK.detail(requestId ?? 0),
    queryFn: () => signatureRequestsApi.getById(requestId!),
    enabled: open,
  })

  const events = data?.audit_trail ?? []

  return (
    <DetailDrawer
      open={open}
      title={data?.title ?? SIGNATURE_REQUESTS_MESSAGES.audit.defaultTitle}
      subtitle={data ? getSignatureRequestTypeLabel(data.request_type) : undefined}
      onClose={onClose}
    >
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} height="h-8" width="w-full" />
          ))}
        </div>
      )}

      {data && (
        <>
          <DrawerSection title={SIGNATURE_REQUESTS_MESSAGES.audit.requestDetails}>
            <DefinitionList
              layout="stacked"
              items={[
                {
                  label: SIGNATURE_REQUESTS_MESSAGES.fields.status,
                  value: (
                    <StatusBadge
                      status={data.status}
                      getLabel={getSignatureRequestStatusLabel}
                      variantMap={signatureRequestStatusVariants}
                    />
                  ),
                },
                { label: SIGNATURE_REQUESTS_MESSAGES.fields.signer, value: data.signer_name },
                ...(data.signer_email
                  ? [{ label: SIGNATURE_REQUESTS_MESSAGES.fields.signerEmail, value: data.signer_email }]
                  : []),
                ...(data.signer_phone
                  ? [
                      {
                        label: SIGNATURE_REQUESTS_MESSAGES.fields.signerPhone,
                        value: formatPhoneNumber(data.signer_phone),
                      },
                    ]
                  : []),
                { label: SIGNATURE_REQUESTS_MESSAGES.fields.createdAt, value: formatDateTime(data.created_at) },
                ...(data.updated_at
                  ? [{ label: SIGNATURE_REQUESTS_MESSAGES.fields.updatedAt, value: formatDateTime(data.updated_at) }]
                  : []),
                ...(data.sent_at
                  ? [{ label: SIGNATURE_REQUESTS_MESSAGES.fields.sentAt, value: formatDateTime(data.sent_at) }]
                  : []),
                ...(data.expires_at
                  ? [{ label: SIGNATURE_REQUESTS_MESSAGES.fields.expiresAt, value: formatDate(data.expires_at) }]
                  : []),
                ...(data.signed_at
                  ? [{ label: SIGNATURE_REQUESTS_MESSAGES.fields.signedAt, value: formatDateTime(data.signed_at) }]
                  : []),
                ...(data.decline_reason
                  ? [{ label: SIGNATURE_REQUESTS_MESSAGES.fields.declineReason, value: data.decline_reason }]
                  : []),
              ]}
            />
          </DrawerSection>

          <DrawerSection title={SIGNATURE_REQUESTS_MESSAGES.audit.activityHistory}>
            {events.length === 0 && (
              <p className="py-3 text-sm text-gray-400">{SIGNATURE_REQUESTS_MESSAGES.audit.noEvents}</p>
            )}
            <Timeline>
              {events.map((event) => (
                <TimelineEntry key={event.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-800">
                      {SIGNATURE_REQUEST_EVENT_TYPE_LABELS[
                        event.event_type as keyof typeof SIGNATURE_REQUEST_EVENT_TYPE_LABELS
                      ] ?? event.event_type}
                    </span>
                    <span className="text-xs text-gray-400">{formatDateTime(event.occurred_at)}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {SIGNATURE_REQUEST_ACTOR_TYPE_LABELS[
                      event.actor_type as keyof typeof SIGNATURE_REQUEST_ACTOR_TYPE_LABELS
                    ] ?? event.actor_type}
                    {event.actor_name ? ` — ${event.actor_name}` : ''}
                    {event.notes ? ` · ${event.notes}` : ''}
                  </div>
                </TimelineEntry>
              ))}
            </Timeline>
          </DrawerSection>
        </>
      )}
    </DetailDrawer>
  )
}
