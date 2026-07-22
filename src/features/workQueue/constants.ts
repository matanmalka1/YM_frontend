import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import { makeVariantGetter } from '@/utils/labels'
import { PAGE_SIZE_SM } from '@/constants/pagination.constants'
import {
  parseWorkItemSourceType,
  workItemSourceTypeLabels as workQueueSourceTypeLabels,
  workItemSourceTypeValues as workQueueSourceTypeValues,
  type WorkItemSourceType,
} from '@/constants/workItemSources.constants'

export { workQueueSourceTypeLabels, workQueueSourceTypeValues }
export type WorkQueueSourceType = WorkItemSourceType

export const WORK_QUEUE_ROUTE = '/work-queue'

export const APPROACHING_DAYS = 7
export const IMPORTANT_DAYS = 21
export const WORK_QUEUE_PAGE_SIZE = PAGE_SIZE_SM

export const workQueueUrgencyValues = ['overdue', 'approaching', 'important', 'upcoming'] as const

export const WORK_QUEUE_FILTER_PARAM_KEYS = {
  search: 'search',
  urgency: 'urgency',
  sourceType: 'source_type',
  taskStatus: 'task_status',
  linked: 'linked',
  scope: 'scope',
} as const

export type WorkQueueUrgency = (typeof workQueueUrgencyValues)[number]

export type WorkQueueFilterParamKey = (typeof WORK_QUEUE_FILTER_PARAM_KEYS)[keyof typeof WORK_QUEUE_FILTER_PARAM_KEYS]
export const parseWorkQueueSourceType = (value: string | null): WorkQueueSourceType | null => parseWorkItemSourceType(value)

const isWorkQueueUrgency = (value: string | null): value is WorkQueueUrgency =>
  value !== null && workQueueUrgencyValues.includes(value as WorkQueueUrgency)

export const parseWorkQueueUrgency = (value: string | null): WorkQueueUrgency | null => (isWorkQueueUrgency(value) ? value : null)

export const workQueueUrgencyLabels: Record<WorkQueueUrgency, string> = {
  overdue: 'באיחור',
  approaching: 'דחוף',
  important: 'חשוב',
  upcoming: 'קרוב',
}

const workQueueUrgencyVariant: Record<WorkQueueUrgency, BadgeVariant> = {
  overdue: 'negative',
  approaching: 'warning',
  important: 'warning',
  upcoming: 'info',
}
export const getWorkQueueUrgencyVariant = makeVariantGetter(workQueueUrgencyVariant)
