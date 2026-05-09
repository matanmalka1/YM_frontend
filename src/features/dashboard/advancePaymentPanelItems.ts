import { formatDate, getReportingPeriodMonthLabel } from '@/utils/utils'
import { workQueueSourceTypeLabels, workQueueUrgencyLabels } from '@/features/workQueue'
import type { WorkQueueItem, WorkQueueSourceType, WorkQueueUrgency } from '@/features/workQueue'
import type { PanelItem } from './attentionBoardSections'

const ADVANCE_PAYMENTS_HREF = '/tax/advance-payments'

const formatPeriod = (value: string): string => {
  return /^\d{4}-\d{2}$/.test(value) ? getReportingPeriodMonthLabel(value) : value
}

const getPayloadString = (item: WorkQueueItem, key: string): string | null => {
  const value = item.payload?.[key]
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return null
}

const getLabelDetail = (label: string): string | null => {
  const detail = label.split(':').slice(1).join(':').trim()
  if (!detail) return null
  return formatPeriod(detail)
}

const getItemTitle = (item: WorkQueueItem): string => {
  return item.client_name || item.label || 'לקוח ללא שם'
}

const getSourceLabel = (item: WorkQueueItem): string => {
  return workQueueSourceTypeLabels[item.source_type as WorkQueueSourceType] ?? item.source_type
}

const getUrgencyLabel = (urgency?: string | null): string | undefined => {
  if (!urgency) return undefined
  return workQueueUrgencyLabels[urgency as WorkQueueUrgency] ?? urgency
}

const getItemSubtitle = (item: WorkQueueItem): string => {
  const sourceLabel = getSourceLabel(item)
  const period = getPayloadString(item, 'period')
  if (period) return `${sourceLabel} · ${formatPeriod(period)}`

  const detail = getLabelDetail(item.label)
  if (detail) return `${sourceLabel} · ${detail}`

  if (item.label.startsWith(sourceLabel)) return item.label
  return `${sourceLabel} · ${item.label}`
}

export const mapAdvancePaymentToPanelItem = (item: WorkQueueItem): PanelItem => {
  const urgencyLabel = getUrgencyLabel(item.urgency)
  return {
    id: `work-queue-${item.source_type}-${item.source_id}`,
    label: getItemTitle(item),
    sublabel: getItemSubtitle(item),
    href: ADVANCE_PAYMENTS_HREF,
    meta: {
      description: [urgencyLabel, formatDate(item.due_date)].filter(Boolean).join(' · '),
    },
  }
}

export const isAdvancePaymentWorkQueueItem = (item: WorkQueueItem): boolean =>
  item.source_type === 'advance_payment'
