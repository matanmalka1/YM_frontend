import { format, parseISO } from 'date-fns'
import { he } from 'date-fns/locale'
import { createElement, type ReactNode } from 'react'
import {
  AlertCircle,
  ArrowLeftRight,
  CheckCircle,
  CreditCard,
  FileText,
  FolderInput,
  FolderOutput,
  PenLine,
  Receipt,
  Upload,
  UserPlus,
  XCircle,
  type LucideIcon,
} from 'lucide-react'

// ── Unified event registry ────────────────────────────────────────────────────
// Keep label + icon co-located so adding a new event type is a single-line change.

interface EventMeta {
  label: string
  icon: LucideIcon
}

const EVENT_REGISTRY: Record<string, EventMeta> = {
  binder_received: { label: 'קליטת קלסר', icon: FolderInput },
  binder_returned: { label: 'החזרת קלסר', icon: FolderOutput },
  binder_status_change: { label: 'שינוי סטטוס קלסר', icon: ArrowLeftRight },
  invoice_attached: { label: 'חשבונית צורפה', icon: Receipt },
  charge_created: { label: 'יצירת חיוב', icon: CreditCard },
  charge_issued: { label: 'הנפקת חיוב', icon: CreditCard },
  charge_paid: { label: 'תשלום חיוב', icon: CheckCircle },
  annual_report_status_changed: { label: 'דוח שנתי', icon: FileText },
  client_created: { label: 'לקוח נוצר', icon: UserPlus },
  document_uploaded: { label: 'מסמך הועלה', icon: Upload },
  signature_request_sent: { label: 'בקשת חתימה נשלחה', icon: PenLine },
  signature_request_signed: { label: 'מסמך נחתם', icon: CheckCircle },
  signature_request_declined: { label: 'חתימה נדחתה', icon: XCircle },
  signature_request_canceled: { label: 'בקשת חתימה בוטלה', icon: XCircle },
  signature_request_expired: { label: 'בקשת חתימה פגה', icon: XCircle },
}

const FALLBACK: EventMeta = { label: 'אירוע', icon: AlertCircle }

const getEventMeta = (eventType: string): EventMeta => EVENT_REGISTRY[eventType] ?? FALLBACK

export const getEventTypeLabel = (eventType: string): string => getEventMeta(eventType).label

export const getEventIcon = (eventType: string): ReactNode =>
  createElement(getEventMeta(eventType).icon, { className: 'h-3.5 w-3.5' })

// ── Date helpers ──────────────────────────────────────────────────────────────

export const formatTimestamp = (timestamp: string): string => format(parseISO(timestamp), 'HH:mm', { locale: he })

export const formatTimelineDate = (timestamp: string): string =>
  format(parseISO(timestamp), 'd MMMM yyyy', { locale: he })

export const formatDateHeading = (timestamp: string): string =>
  format(parseISO(timestamp), 'EEEE, d MMMM yyyy', { locale: he })
