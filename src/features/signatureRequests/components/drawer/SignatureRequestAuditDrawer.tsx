import { GLOBAL_UI_MESSAGES } from '@/messages'
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
  SIGNATURE_REQUEST_AUDIT_FIELD_LABELS,
  SIGNATURE_REQUEST_STATUS_VARIANTS,
  getSignatureRequestAuditActionLabel,
  getSignatureRequestTypeLabel,
  getSignatureRequestStatusLabel,
} from '../../constants'
import { SIGNATURE_REQUESTS_MESSAGES } from '../../messages'

interface Props {
  requestId: number | null
  onClose: () => void
}

interface AuditMetadataItem {
  label: string
  value: string
}

export const SignatureRequestAuditDrawer: React.FC<Props> = ({ requestId, onClose }) => {
  const open = requestId != null

  const { data, isLoading } = useQuery({
    queryKey: signatureRequestsQK.detail(requestId ?? 0),
    queryFn: () => signatureRequestsApi.getById(requestId!),
    enabled: open,
  })

  const events = data?.audit_trail ?? []
  const auditMetadataItems = (event: (typeof events)[number]): AuditMetadataItem[] => {
    const items: Array<AuditMetadataItem | null> = [
      event.signer_email ? { label: SIGNATURE_REQUESTS_MESSAGES.fields.signerEmail, value: event.signer_email } : null,
      event.ip_address ? { label: SIGNATURE_REQUEST_AUDIT_FIELD_LABELS.ipAddress, value: event.ip_address } : null,
      event.user_agent ? { label: SIGNATURE_REQUEST_AUDIT_FIELD_LABELS.userAgent, value: event.user_agent } : null,
      event.content_hash ? { label: SIGNATURE_REQUEST_AUDIT_FIELD_LABELS.contentHash, value: event.content_hash } : null,
      event.content_hash_missing
        ? {
            label: SIGNATURE_REQUEST_AUDIT_FIELD_LABELS.contentHash,
            value: SIGNATURE_REQUEST_AUDIT_FIELD_LABELS.contentHashMissing,
          }
        : null,
      event.signed_document_key
        ? { label: SIGNATURE_REQUEST_AUDIT_FIELD_LABELS.signedDocument, value: event.signed_document_key }
        : null,
      event.reason ? { label: SIGNATURE_REQUESTS_MESSAGES.fields.declineReason, value: event.reason } : null,
    ]
    return items.filter((item): item is AuditMetadataItem => item != null)
  }

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
                  label: GLOBAL_UI_MESSAGES.common.status,
                  value: (
                    <StatusBadge
                      status={data.status}
                      getLabel={getSignatureRequestStatusLabel}
                      variantMap={SIGNATURE_REQUEST_STATUS_VARIANTS}
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
            {events.length === 0 && <p className="py-3 text-sm text-gray-400">{SIGNATURE_REQUESTS_MESSAGES.audit.noEvents}</p>}
            <Timeline>
              {events.map((event) => {
                const metadataItems = auditMetadataItems(event)
                return (
                  <TimelineEntry key={event.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-800">
                        {getSignatureRequestAuditActionLabel(event.action)}
                      </span>
                      <span className="text-xs text-gray-400">{formatDateTime(event.performed_at)}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500">
                      {SIGNATURE_REQUEST_ACTOR_TYPE_LABELS[event.actor_type] ?? event.actor_type}
                      {event.actor_display_name ? ` — ${event.actor_display_name}` : ''}
                      {event.note ? ` · ${event.note}` : ''}
                    </div>
                    {metadataItems.length > 0 && (
                      <dl className="mt-2 grid gap-1 text-xs text-gray-500">
                        {metadataItems.map((item) => (
                          <div key={`${event.id}-${item.label}`} className="grid grid-cols-[7rem_1fr] gap-2">
                            <dt className="text-gray-400">{item.label}</dt>
                            <dd className="break-words">{item.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </TimelineEntry>
                )
              })}
            </Timeline>
          </DrawerSection>
        </>
      )}
    </DetailDrawer>
  )
}
