import { formatDate } from '@/utils/utils'
import { workQueueSourceTypeLabels } from '../constants'
import type { WorkQueueItem } from '../api'

const metadataText = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) return value
  if (typeof value === 'number') return String(value)
  return null
}

const metadataValue = (item: WorkQueueItem, key: string): unknown => {
  const metadata = item.metadata as Record<string, unknown> | null | undefined
  return metadata?.[key]
}

const groupLabel = (item: WorkQueueItem): string => {
  if (item.source_type === 'task') return 'משימות ידניות'
  const type = item.type_label ?? workQueueSourceTypeLabels[item.source_type] ?? item.source_type
  const period = metadataText(metadataValue(item, 'period_label')) ?? metadataText(metadataValue(item, 'period'))
  const taxYear = metadataText(metadataValue(item, 'tax_year'))
  const datePart = item.due_date ? `תאריך יעד  ${formatDate(item.due_date)}` : 'ללא תאריך יעד'
  const context = period ?? taxYear
  return context ? `${type} · ${context} · ${datePart}` : `${type} · ${datePart}`
}

const groupKey = (item: WorkQueueItem): string => {
  if (item.source_type === 'task') return 'task:standalone'
  const period = metadataText(metadataValue(item, 'period'))
  const taxYear = metadataText(metadataValue(item, 'tax_year'))
  return [item.source_type, period ?? taxYear ?? 'none', item.due_date ?? 'no-due-date'].join(':')
}

export const groupWorkQueueItems = (items: WorkQueueItem[]) => {
  const groups = new Map<string, { label: string; rows: WorkQueueItem[] }>()
  for (const item of items) {
    const key = groupKey(item)
    const label = groupLabel(item)
    const group = groups.get(key)
    if (group) group.rows.push(item)
    else groups.set(key, { label, rows: [item] })
  }
  return Array.from(groups, ([key, group]) => ({ key, ...group }))
}
