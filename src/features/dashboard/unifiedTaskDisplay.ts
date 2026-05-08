import { formatDate, getReportingPeriodMonthLabel } from '@/utils/utils'
import { taskTypeLabels, taskUrgencyLabels } from '@/features/tasks'
import type { TaskType, TaskUrgency, UnifiedItem } from '@/features/tasks'
import type { PanelItem } from './attentionPanelSections'

const getUnifiedItemHref = (item: UnifiedItem) => {
  if (item.item_type === 'reminder') return '/reminders'

  switch (item.source_type) {
    case 'vat_filing':
      return '/tax/vat'
    case 'annual_report':
      return '/tax/reports'
    case 'advance_payment':
      return '/tax/advance-payments'
    case 'unpaid_charge':
      return '/charges'
    default:
      return '/'
  }
}

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
  if (item.item_type === 'reminder') return 'תזכורת'
  return taskTypeLabels[item.source_type as TaskType] ?? item.source_type
}

const getUrgencyLabel = (urgency?: string | null): string | undefined => {
  if (!urgency) return undefined
  return taskUrgencyLabels[urgency as TaskUrgency] ?? urgency
}

const getTaskSubtitle = (item: UnifiedItem): string => {
  if (item.item_type === 'reminder') return 'תזכורת'

  const sourceLabel = getSourceLabel(item)
  const period = getPayloadString(item, 'period')
  if (period) return `${sourceLabel} · ${formatPeriod(period)}`

  const taxYear = getPayloadString(item, 'tax_year')
  if (taxYear) return `${sourceLabel} · ${taxYear}`

  const detail = getLabelDetail(item.label)
  if (detail) return `${sourceLabel} · ${detail}`

  if (item.label.startsWith(sourceLabel)) return item.label
  return `${sourceLabel} · ${item.label}`
}

export const mapUnifiedItemToPanelItem = (item: UnifiedItem): PanelItem => {
  const urgencyLabel = getUrgencyLabel(item.urgency)
  return {
    id: `${item.item_type}-${item.source_type}-${item.source_id}`,
    label: getTaskTitle(item),
    sublabel: getTaskSubtitle(item),
    href: getUnifiedItemHref(item),
    meta: {
      description: [urgencyLabel, formatDate(item.due_date)].filter(Boolean).join(' · '),
    },
  }
}
