import { Search } from 'lucide-react'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { Button } from '@/components/ui/primitives/Button'
import { cn } from '@/utils/utils'
import {
  WORK_QUEUE_FILTER_PARAM_KEYS,
  parseWorkQueueSourceType,
  workQueueSourceTypeLabels,
  workQueueSourceTypeValues,
  workQueueUrgencyLabels,
  type WorkQueueFilterParamKey,
} from '../constants'
// eslint-disable-next-line no-restricted-imports -- avoid the tasks feature barrel here; it imports workQueue-backed components.
import { parseTaskStatus, type TaskStatus } from '@/features/tasks/api/contracts'
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

const typeOptions = [
  { value: '', label: 'כל הסוגים' },
  ...workQueueSourceTypeValues.map((v) => ({ value: v, label: workQueueSourceTypeLabels[v] })),
]

const statusOptions = [
  { value: '', label: 'כל סטטוסי המשימה' },
  ...taskStatusValues.map((v) => ({ value: v, label: taskStatusLabels[v] })),
]

type TaskRelationFilter = '' | 'manual' | 'linked' | 'unlinked' | 'system'

const taskRelationOptions: { value: TaskRelationFilter; label: string }[] = [
  { value: '', label: 'כל העבודה הפעילה' },
  { value: 'manual', label: 'משימות עצמאיות בלבד' },
  { value: 'linked', label: 'פריטים עם משימה קשורה' },
  { value: 'unlinked', label: 'פריטים ללא משימה קשורה' },
  { value: 'system', label: 'פריטי עבודה שאינם משימה' },
]

const taskRelationValue = (
  scopeFilter: 'system' | 'manual' | null,
  linkedFilter: 'linked' | 'unlinked' | null,
): TaskRelationFilter => {
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
  hasFilters,
  onFilterChange,
  onMultiFilterChange,
  onClear,
}) => {
  const selectedTaskRelation = taskRelationValue(scopeFilter, linkedFilter)
  const onTaskRelationChange = (value: string) => {
    if (value === 'manual') {
      onMultiFilterChange({
        [WORK_QUEUE_FILTER_PARAM_KEYS.scope]: 'manual',
        [WORK_QUEUE_FILTER_PARAM_KEYS.linked]: '',
      })
      return
    }
    if (value === 'system') {
      onMultiFilterChange({
        [WORK_QUEUE_FILTER_PARAM_KEYS.scope]: 'system',
        [WORK_QUEUE_FILTER_PARAM_KEYS.linked]: '',
      })
      return
    }
    if (value === 'linked' || value === 'unlinked') {
      onMultiFilterChange({
        [WORK_QUEUE_FILTER_PARAM_KEYS.scope]: '',
        [WORK_QUEUE_FILTER_PARAM_KEYS.linked]: value,
      })
      return
    }
    onMultiFilterChange({
      [WORK_QUEUE_FILTER_PARAM_KEYS.scope]: '',
      [WORK_QUEUE_FILTER_PARAM_KEYS.linked]: '',
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="min-w-[220px] flex-1">
        <Input
          value={search}
          onChange={(e) => onFilterChange(WORK_QUEUE_FILTER_PARAM_KEYS.search, e.target.value)}
          placeholder={WORK_QUEUE_SEARCH_PLACEHOLDER}
          startIcon={<Search className="h-4 w-4" />}
          className={cn(search.trim() && 'border-primary-400 bg-primary-50/40 ring-1 ring-primary-200')}
        />
      </div>
      <div className="w-36 shrink-0">
        <Select
          options={typeOptions}
          value={typeFilter ?? ''}
          onChange={(e) =>
            onFilterChange(WORK_QUEUE_FILTER_PARAM_KEYS.sourceType, parseWorkQueueSourceType(e.target.value) ?? '')
          }
          className={cn(typeFilter && 'border-primary-400 bg-primary-50/40 ring-1 ring-primary-200')}
        />
      </div>
      <div className="w-44 shrink-0">
        <Select
          options={statusOptions}
          value={statusFilter ?? ''}
          onChange={(e) =>
            onFilterChange(WORK_QUEUE_FILTER_PARAM_KEYS.taskStatus, parseTaskStatus(e.target.value) ?? '')
          }
          className={cn(statusFilter && 'border-primary-400 bg-primary-50/40 ring-1 ring-primary-200')}
        />
      </div>
      <div className="w-52 shrink-0">
        <Select
          options={taskRelationOptions}
          value={selectedTaskRelation}
          onChange={(e) => onTaskRelationChange(e.target.value)}
          className={cn(selectedTaskRelation && 'border-primary-400 bg-primary-50/40 ring-1 ring-primary-200')}
        />
      </div>
      <Button
        variant={historyMode ? 'secondary' : 'ghost'}
        size="sm"
        aria-pressed={historyMode}
        className={cn(historyMode && 'ring-2 ring-primary-300 ring-offset-1')}
        onClick={() => onFilterChange(WORK_QUEUE_FILTER_PARAM_KEYS.history, historyMode ? '' : 'true')}
      >
        היסטוריה
      </Button>
      {urgencyFilter && (
        <Button
          variant="secondary"
          size="sm"
          aria-pressed
          onClick={() => onFilterChange(WORK_QUEUE_FILTER_PARAM_KEYS.urgency, '')}
        >
          {`דחיפות: ${workQueueUrgencyLabels[urgencyFilter]}`}
        </Button>
      )}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          אפס סינון
        </Button>
      )}
    </div>
  )
}
