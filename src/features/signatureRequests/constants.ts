import { makeLabelGetter } from '@/utils/labels'
import type { SignatureRequestStatus, SignatureRequestType } from './api'

/** @auditContract Read by the backend enum-sync audit. */
export const SIGNATURE_REQUEST_STATUS_VALUES = [
  'pending_signature',
  'signed',
  'declined',
  'expired',
  'canceled',
] as const satisfies readonly SignatureRequestStatus[]

const SIGNATURE_REQUEST_STATUS_LABELS: Record<SignatureRequestStatus, string> = {
  pending_signature: 'ממתין לחתימה',
  signed: 'נחתם',
  declined: 'נדחה',
  expired: 'פג תוקף',
  canceled: 'בוטל',
}
export const getSignatureRequestStatusLabel = makeLabelGetter(SIGNATURE_REQUEST_STATUS_LABELS)

/** @auditContract Read by the backend enum-sync audit. */
export const SIGNATURE_REQUEST_TYPE_VALUES = [
  'engagement_agreement',
  'annual_report_approval',
  'power_of_attorney',
  'vat_return_approval',
  'custom',
] as const satisfies readonly SignatureRequestType[]

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
