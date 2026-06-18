import { makeLabelGetter } from '@/utils/labels'
import type { BusinessStatus } from '@/features/clients'

export const BUSINESS_STATUS_LABELS: Record<BusinessStatus, string> = {
  active: 'פעיל',
  frozen: 'מוקפא',
  closed: 'סגור',
}

export const getBusinessStatusLabel = makeLabelGetter(BUSINESS_STATUS_LABELS)

export const BUSINESS_STATUS_BADGE_VARIANTS = {
  active: 'success',
  frozen: 'warning',
  closed: 'neutral',
} as const satisfies Record<BusinessStatus, 'success' | 'warning' | 'neutral'>


export const BUSINESS_STATUS_OPTIONS = (Object.keys(BUSINESS_STATUS_LABELS) as BusinessStatus[]).map((status) => ({
  value: status,
  label: BUSINESS_STATUS_LABELS[status],
}))

export const BUSINESS_DETAILS_COPY = {
  title: 'פרטי עסק',
  invalidId: 'מזהה לא תקין',
  loading: 'טוען פרטי עסק...',
  clientsListLabel: 'לקוחות',
  clientFallback: 'לקוח',
  sectionTitle: 'פרטי פעילות',
  systemIdLabel: 'מזהה מערכת',
  clientLabel: 'לקוח',
  businessNameLabel: 'שם עסק',
  statusLabel: 'סטטוס',
  openedAtLabel: 'נפתח בתאריך',
  closedAtLabel: 'נסגר בתאריך',
  createdAtLabel: 'נוצר בתאריך',
  emptyValue: '—',
} as const
