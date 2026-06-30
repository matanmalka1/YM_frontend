import { makeLabelGetter } from '@/utils/labels'
import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import type {
  SignatureRequestAuditAction,
  SignatureRequestAuditActorType,
  SignatureRequestStatus,
  SignatureRequestType,
} from './api'

const SIGNATURE_REQUEST_AUDIT_ACTIONS = [
  'signature_request.created',
  'signature_request.sent',
  'signature_request.viewed',
  'signature_request.signed',
  'signature_request.declined',
  'signature_request.canceled',
  'signature_request.expired',
  'signature_request.annual_report_signed',
] as const satisfies readonly SignatureRequestAuditAction[]

const SIGNATURE_REQUEST_ACTION_LABELS: Record<SignatureRequestAuditAction, string> = {
  'signature_request.created': 'נוצרה',
  'signature_request.sent': 'נשלחה',
  'signature_request.viewed': 'נצפתה',
  'signature_request.signed': 'נחתמה',
  'signature_request.annual_report_signed': 'דוח שנתי נחתם',
  'signature_request.declined': 'נדחתה',
  'signature_request.canceled': 'בוטלה',
  'signature_request.expired': 'פגה תוקף',
}

const SIGNATURE_REQUEST_AUDIT_ACTION_SET = new Set<string>(SIGNATURE_REQUEST_AUDIT_ACTIONS)

const isSignatureRequestAuditAction = (action: string): action is SignatureRequestAuditAction =>
  SIGNATURE_REQUEST_AUDIT_ACTION_SET.has(action)

export const getSignatureRequestAuditActionLabel = (action: string): string =>
  isSignatureRequestAuditAction(action) ? SIGNATURE_REQUEST_ACTION_LABELS[action] : action

export const SIGNATURE_REQUEST_ACTOR_TYPE_LABELS: Record<SignatureRequestAuditActorType, string> = {
  user: 'משתמש',
  external_signer: 'חותם',
  system: 'מערכת',
}

export const SIGNATURE_REQUEST_AUDIT_FIELD_LABELS = {
  ipAddress: 'IP',
  userAgent: 'User-Agent',
  contentHash: 'SHA-256',
  contentHashMissing: 'לא זמין',
  signedDocument: 'מסמך חתום',
} as const

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

export const SIGNATURE_REQUEST_STATUS_VARIANTS: Record<SignatureRequestStatus, BadgeVariant> = {
  pending_signature: 'info',
  signed: 'positive',
  declined: 'negative',
  expired: 'warning',
  canceled: 'neutral',
}
