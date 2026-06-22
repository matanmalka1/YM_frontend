import { useMemo } from 'react'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import type { FilterFieldDef } from '@/components/ui/filters/types'
import type { FilterBadge } from '@/components/ui/table/ActiveFilterBadges'
import {
  WORK_QUEUE_FILTER_PARAM_KEYS,
  workQueueSourceTypeLabels,
  workQueueSourceTypeValues,
  workQueueUrgencyLabels,
  type WorkQueueFilterParamKey,
} from '../constants'
// eslint-disable-next-line no-restricted-imports -- avoid the tasks feature barrel here; it imports workQueue-backed components.
import { type TaskStatus } from '@/features/tasks/api/contracts'
import { WORK_QUEUE_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'
// eslint-disable-next-line no-restricted-imports -- avoid the tasks feature barrel here; it imports workQueue-backed components.
import { taskStatusLabels, taskStatusValues } from '@/features/tasks/constants/labels'
import type { WorkQueueSourceType, WorkQueueUrgency } from '../api/contracts'

interface WorkQueueFiltersBarProps {
  search: string
  urgencyFilter: WorkQueueUrgency | null
  typeFilter: WorkQueueSourceType | null
  statusFilter: TaskStatus | null
  linkedFilter: 'linked' | 'unlinked' | null
  scopeFilter: 'system' | 'manual' | null
  historyMode: boolean
  hasFilters: boolean
  onFilterChange: (key: WorkQueueFilterParamKey, value: string) => void
  onMultiFilterChange: (updates: Partial<Record<WorkQueueFilterParamKey, string>>) => void
  onClear: () => void
}

/** Synthetic field key collapsing scope + linked into one dropdown. */
const TASK_RELATION_KEY = 'task_relation'

const typeOptions = [
  { value: '', label: 'כל הסוגים' },
  ...workQueueSourceTypeValues.map((v) => ({ value: v, label: workQueueSourceTypeLabels[v] })),
]

const statusOptions = [
  { value: '', label: 'כל סטטוסי המשימה' },
  ...taskStatusValues.map((v) => ({ value: v, label: taskStatusLabels[v] })),
]

const taskRelationOptions = [
  { value: '', label: 'כל העבודה הפעילה' },
  { value: 'manual', label: 'משימות עצמאיות בלבד' },
  { value: 'linked', label: 'פריטים עם משימה קשורה' },
  { value: 'unlinked', label: 'פריטים ללא משימה קשורה' },
  { value: 'system', label: 'פריטי עבודה שאינם משימה' },
]

const viewOptions = [
  { value: '', label: 'עבודה פעילה' },
  { value: 'true', label: 'היסטוריית משימות' },
]

const fields: FilterFieldDef[] = [
  { type: 'search', key: WORK_QUEUE_FILTER_PARAM_KEYS.search, label: 'חיפוש', placeholder: WORK_QUEUE_SEARCH_PLACEHOLDER },
  { type: 'select', key: WORK_QUEUE_FILTER_PARAM_KEYS.sourceType, label: 'סוג', options: typeOptions },
  { type: 'select', key: WORK_QUEUE_FILTER_PARAM_KEYS.taskStatus, label: 'סטטוס משימה', options: statusOptions },
  { type: 'select', key: TASK_RELATION_KEY, label: 'סוג עבודה', options: taskRelationOptions },
  { type: 'select', key: WORK_QUEUE_FILTER_PARAM_KEYS.history, label: 'תצוגה', options: viewOptions },
]

const taskRelationValue = (
  scopeFilter: 'system' | 'manual' | null,
  linkedFilter: 'linked' | 'unlinked' | null,
): string => {
  if (scopeFilter === 'manual') return 'manual'
  if (scopeFilter === 'system') return 'system'
  if (linkedFilter === 'linked') return 'linked'
  if (linkedFilter === 'unlinked') return 'unlinked'
  return ''
}

export const WorkQueueFiltersBar: React.FC<WorkQueueFiltersBarProps> = ({
  search,
  urgencyFilter,
  typeFilter,
  statusFilter,
  linkedFilter,
  scopeFilter,
  historyMode,
  onFilterChange,
  onMultiFilterChange,
  onClear,
}) => {
  const values = useMemo(
    () => ({
      [WORK_QUEUE_FILTER_PARAM_KEYS.search]: search,
      [WORK_QUEUE_FILTER_PARAM_KEYS.sourceType]: typeFilter ?? '',
      [WORK_QUEUE_FILTER_PARAM_KEYS.taskStatus]: statusFilter ?? '',
      [TASK_RELATION_KEY]: taskRelationValue(scopeFilter, linkedFilter),
      [WORK_QUEUE_FILTER_PARAM_KEYS.history]: historyMode ? 'true' : '',
    }),
    [search, typeFilter, statusFilter, scopeFilter, linkedFilter, historyMode],
  )

  const handleChange = (key: string, value: string) => {
    if (key === TASK_RELATION_KEY) {
      const scope = value === 'manual' || value === 'system' ? value : ''
      const linked = value === 'linked' || value === 'unlinked' ? value : ''
      onMultiFilterChange({
        [WORK_QUEUE_FILTER_PARAM_KEYS.scope]: scope,
        [WORK_QUEUE_FILTER_PARAM_KEYS.linked]: linked,
      })
      return
    }
    onFilterChange(key as WorkQueueFilterParamKey, value)
  }

  // Urgency is set by clicking the stats cards (no dropdown), so surface it as a removable badge.
  const extraBadges: FilterBadge[] | undefined = urgencyFilter
    ? [
        {
          key: WORK_QUEUE_FILTER_PARAM_KEYS.urgency,
          label: `דחיפות: ${workQueueUrgencyLabels[urgencyFilter]}`,
          onRemove: () => onFilterChange(WORK_QUEUE_FILTER_PARAM_KEYS.urgency, ''),
        },
      ]
    : undefined

  return (
    <FilterPanel
      fields={fields}
      values={values}
      onChange={handleChange}
      onReset={onClear}
      extraBadges={extraBadges}
      gridClass="grid-cols-1 sm:grid-cols-2 xl:grid-cols-5"
    />
  )
}
