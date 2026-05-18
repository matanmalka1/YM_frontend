import { z } from 'zod'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { Button } from '@/components/ui/primitives/Button'
import { cn } from '@/utils/utils'
import { workQueueSourceTypeLabels, workQueueSourceTypeValues, workQueueUrgencyLabels } from '../constants'
import { taskStatusLabels, taskStatusValues } from '@/features/tasks'
import type { WorkQueueSourceType, WorkQueueUrgency } from '../api/contracts'
import type { TaskStatus } from '@/features/tasks'

interface WorkQueueFiltersBarProps {
  search: string
  onSearchChange: (value: string) => void
  urgencyFilter: WorkQueueUrgency | null
  onUrgencyChange: (value: WorkQueueUrgency | null) => void
  typeFilter: WorkQueueSourceType | null
  onTypeChange: (value: WorkQueueSourceType | null) => void
  statusFilter: TaskStatus | null
  onStatusChange: (value: TaskStatus | null) => void
  linkedFilter: 'linked' | 'unlinked' | null
  onLinkedChange: (value: 'linked' | 'unlinked' | null) => void
  scopeFilter: 'system' | 'manual' | null
  onScopeChange: (value: 'system' | 'manual' | null) => void
  historyMode: boolean
  onHistoryModeChange: (value: boolean) => void
  hasFilters: boolean
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

const parseSourceType = (value: string): WorkQueueSourceType | null => {
  const result = z.enum(workQueueSourceTypeValues).safeParse(value)
  return result.success ? result.data : null
}

const parseTaskStatus = (value: string): TaskStatus | null => {
  const result = z.enum(taskStatusValues).safeParse(value)
  return result.success ? result.data : null
}

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
  onSearchChange,
  urgencyFilter,
  onUrgencyChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  linkedFilter,
  onLinkedChange,
  scopeFilter,
  onScopeChange,
  historyMode,
  onHistoryModeChange,
  hasFilters,
  onClear,
}) => {
  const selectedTaskRelation = taskRelationValue(scopeFilter, linkedFilter)
  const onTaskRelationChange = (value: string) => {
    if (value === 'manual') {
      onScopeChange('manual')
      onLinkedChange(null)
      return
    }
    if (value === 'system') {
      onScopeChange('system')
      onLinkedChange(null)
      return
    }
    if (value === 'linked' || value === 'unlinked') {
      onScopeChange(null)
      onLinkedChange(value)
      return
    }
    onScopeChange(null)
    onLinkedChange(null)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="min-w-[220px] flex-1">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="חיפוש לפי לקוח, מספר, כותרת או משימה"
          startIcon={<Search className="h-4 w-4" />}
          className={cn(search.trim() && 'border-primary-400 bg-primary-50/40 ring-1 ring-primary-200')}
        />
      </div>
      <div className="w-36 shrink-0">
        <Select
          options={typeOptions}
          value={typeFilter ?? ''}
          onChange={(e) => onTypeChange(parseSourceType(e.target.value))}
          className={cn(typeFilter && 'border-primary-400 bg-primary-50/40 ring-1 ring-primary-200')}
        />
      </div>
      <div className="w-44 shrink-0">
        <Select
          options={statusOptions}
          value={statusFilter ?? ''}
          onChange={(e) => onStatusChange(parseTaskStatus(e.target.value))}
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
        onClick={() => onHistoryModeChange(!historyMode)}
      >
        היסטוריה
      </Button>
      {urgencyFilter && (
        <Button variant="secondary" size="sm" aria-pressed onClick={() => onUrgencyChange(null)}>
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
