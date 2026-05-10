import { formatDate } from '@/utils/utils'
import { workQueueSourceTypeLabels, workQueueUrgencyLabels } from '@/features/workQueue'
import type { AdvancePaymentWorkQueueItem, WorkQueueItem, WorkQueueUrgency } from '@/features/workQueue'
import type { PanelItem } from './attentionBoardSections'

const ADVANCE_PAYMENTS_HREF = '/tax/advance-payments'

const getItemTitle = (item: AdvancePaymentWorkQueueItem): string => {
  return item.client_name || 'לקוח לא ידוע'
}

const getUrgencyLabel = (urgency?: string | null): string | undefined => {
  if (!urgency) return undefined
  return workQueueUrgencyLabels[urgency as WorkQueueUrgency] ?? urgency
}

const getItemSubtitle = (item: AdvancePaymentWorkQueueItem): string => {
  const officeNumber = item.client_office_number == null ? null : `#${item.client_office_number}`
  const sourceLabel = workQueueSourceTypeLabels.advance_payment
  const periodLabel = item.payload.period_label || item.payload.period
  return [officeNumber, sourceLabel, periodLabel].filter(Boolean).join(' · ')
}

export const mapAdvancePaymentToPanelItem = (item: AdvancePaymentWorkQueueItem): PanelItem => {
  const urgencyLabel = getUrgencyLabel(item.urgency)
  return {
    id: `work-queue-${item.source_type}-${item.source_id}`,
    label: getItemTitle(item),
    sublabel: getItemSubtitle(item),
    href: ADVANCE_PAYMENTS_HREF,
    meta: {
      description: [urgencyLabel, formatDate(item.due_date ?? null)].filter(Boolean).join(' · '),
    },
  }
}

export const isAdvancePaymentWorkQueueItem = (item: WorkQueueItem): item is AdvancePaymentWorkQueueItem =>
  item.source_type === 'advance_payment'
