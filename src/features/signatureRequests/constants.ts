import { makeLabelGetter } from '@/utils/labels'
import type { SignatureRequestStatus, SignatureRequestType } from './api'

const SIGNATURE_REQUEST_STATUS_LABELS: Record<SignatureRequestStatus, string> = {
  pending_signature: 'ממתין לחתימה',
  signed: 'נחתם',
  declined: 'נדחה',
  expired: 'פג תוקף',
  canceled: 'בוטל',
}
export const getSignatureRequestStatusLabel = makeLabelGetter(SIGNATURE_REQUEST_STATUS_LABELS)

const SIGNATURE_REQUEST_TYPE_LABELS: Record<SignatureRequestType, string> = {
  engagement_agreement: 'הסכם התקשרות',
  annual_report_approval: 'אישור דוח שנתי',
  power_of_attorney: 'ייפוי כוח',
  vat_return_approval: 'אישור דוח מע"מ',
  custom: 'מותאם אישית',
}
export const getSignatureRequestTypeLabel = makeLabelGetter(SIGNATURE_REQUEST_TYPE_LABELS)

export const SIGNATURE_REQUEST_STATUS_VARIANTS: Record<
  SignatureRequestStatus,
  'neutral' | 'info' | 'warning' | 'success' | 'error'
> = {
  pending_signature: 'info',
  signed: 'success',
  declined: 'error',
  expired: 'warning',
  canceled: 'neutral',
}
