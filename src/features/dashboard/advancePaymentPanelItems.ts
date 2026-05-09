import { formatDate, getReportingPeriodMonthLabel } from '@/utils/utils'
import { taskTypeLabels, taskUrgencyLabels } from '@/features/tasks'
import type { TaskType, TaskUrgency, UnifiedItem } from '@/features/tasks'
import type { PanelItem } from './attentionBoardSections'

const ADVANCE_PAYMENTS_HREF = '/tax/advance-payments'

const formatPeriod = (value: string): string => {
  return /^\d{4}-\d{2}$/.test(value) ? getReportingPeriodMonthLabel(value) : value
}

const getPayloadString = (item: UnifiedItem, key: string): string | null => {
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

const getTaskTitle = (item: UnifiedItem): string => {
  return item.client_name || item.label || 'לקוח ללא שם'
}

const getSourceLabel = (item: UnifiedItem): string => {
  return taskTypeLabels[item.source_type as TaskType] ?? item.source_type
}

const getUrgencyLabel = (urgency?: string | null): string | undefined => {
  if (!urgency) return undefined
  return taskUrgencyLabels[urgency as TaskUrgency] ?? urgency
}

const getTaskSubtitle = (item: UnifiedItem): string => {
  const sourceLabel = getSourceLabel(item)
  const period = getPayloadString(item, 'period')
  if (period) return `${sourceLabel} · ${formatPeriod(period)}`

  const detail = getLabelDetail(item.label)
  if (detail) return `${sourceLabel} · ${detail}`

  if (item.label.startsWith(sourceLabel)) return item.label
  return `${sourceLabel} · ${item.label}`
}

export const mapAdvancePaymentToPanelItem = (item: UnifiedItem): PanelItem => {
  const urgencyLabel = getUrgencyLabel(item.urgency)
  return {
    id: `${item.item_type}-${item.source_type}-${item.source_id}`,
    label: getTaskTitle(item),
    sublabel: getTaskSubtitle(item),
    href: ADVANCE_PAYMENTS_HREF,
    meta: {
      description: [urgencyLabel, formatDate(item.due_date)].filter(Boolean).join(' · '),
    },
  }
}

export const isAdvancePaymentTask = (item: UnifiedItem): boolean =>
  item.item_type === 'task' && item.source_type === 'advance_payment'
