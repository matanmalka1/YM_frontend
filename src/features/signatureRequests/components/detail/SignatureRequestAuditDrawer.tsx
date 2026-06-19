import { useQuery } from '@tanstack/react-query'
import { signatureRequestsApi, signatureRequestsQK } from '../../api'
import { DetailDrawer, DrawerField, DrawerSection } from '../../../../components/ui/overlays/DetailDrawer'
import { SkeletonBlock } from '../../../../components/ui/primitives/SkeletonBlock'
import { StatusBadge } from '../../../../components/ui/primitives/StatusBadge'
import { formatDate, formatDateTime, formatPhoneNumber } from '../../../../utils/utils'
import { getSignatureRequestTypeLabel, getSignatureRequestStatusLabel } from '../../constants'
import { signatureRequestStatusVariants } from '../../utils'

interface Props {
  requestId: number | null
  onClose: () => void
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  created: 'נוצרה',
  sent: 'נשלחה',
  viewed: 'נצפתה',
  signed: 'נחתמה',
  annual_report_signed: 'דוח שנתי נחתם',
  declined: 'נדחתה',
  canceled: 'בוטלה',
  expired: 'פגה תוקף',
}

const ACTOR_TYPE_LABELS: Record<string, string> = {
  advisor: 'יועץ',
  secretary: 'מזכירה',
  signer: 'חותם',
  system: 'מערכת',
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
      title={data?.title ?? 'בקשת חתימה'}
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
          <DrawerSection title="פרטי הבקשה">
            <DrawerField
              label="סטטוס"
              value={
                <StatusBadge
                  status={data.status}
                  getLabel={getSignatureRequestStatusLabel}
                  variantMap={signatureRequestStatusVariants}
                />
              }
            />
            <DrawerField label="חותם" value={data.signer_name} />
            {data.signer_email && <DrawerField label='דוא"ל' value={data.signer_email} />}
            {data.signer_phone && <DrawerField label="טלפון" value={formatPhoneNumber(data.signer_phone)} />}
            <DrawerField label="נוצר" value={formatDateTime(data.created_at)} />
            {data.updated_at && <DrawerField label="עודכן" value={formatDateTime(data.updated_at)} />}
            {data.sent_at && <DrawerField label="נשלח" value={formatDateTime(data.sent_at)} />}
            {data.expires_at && <DrawerField label="תפוגה" value={formatDate(data.expires_at)} />}
            {data.signed_at && <DrawerField label="נחתם" value={formatDateTime(data.signed_at)} />}
            {data.decline_reason && <DrawerField label="סיבת דחייה" value={data.decline_reason} />}
          </DrawerSection>

          <DrawerSection title="היסטוריית פעילות">
            {events.length === 0 && <p className="py-3 text-sm text-gray-400">אין אירועים</p>}
            <div className="divide-y divide-gray-50">
              {events.map((event) => (
                <div key={event.id} className="py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-800">
                      {EVENT_TYPE_LABELS[event.event_type] ?? event.event_type}
                    </span>
                    <span className="text-xs text-gray-400">{formatDateTime(event.occurred_at)}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {ACTOR_TYPE_LABELS[event.actor_type] ?? event.actor_type}
                    {event.actor_name ? ` — ${event.actor_name}` : ''}
                    {event.notes ? ` · ${event.notes}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </DrawerSection>
        </>
      )}
    </DetailDrawer>
  )
}
