import { z } from 'zod'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { Button } from '@/components/ui/primitives/Button'
import {
  workQueueSourceTypeLabels,
  workQueueSourceTypeValues,
  workQueueUrgencyLabels,
  workQueueUrgencyValues,
} from '../constants'
import { taskStatusLabels, taskStatusValues } from '@/features/tasks/constants'
import type { WorkQueueSourceType, WorkQueueUrgency } from '../api/contracts'
import type { TaskStatus } from '@/features/tasks/api'

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

const urgencyOptions = [
  { value: '', label: 'כל הדחיפויות' },
  ...workQueueUrgencyValues.map((v) => ({ value: v, label: workQueueUrgencyLabels[v] })),
]

const linkedOptions = [
  { value: '', label: 'כל המשימות' },
  { value: 'linked', label: 'עם משימה קשורה' },
  { value: 'unlinked', label: 'ללא משימה קשורה' },
]

const statusOptions = [
  { value: '', label: 'כל סטטוסי המשימה' },
  ...taskStatusValues.map((v) => ({ value: v, label: taskStatusLabels[v] })),
]

const scopeOptions = [
  { value: '', label: 'מערכת ומשימות' },
  { value: 'system', label: 'מערכת בלבד' },
  { value: 'manual', label: 'משימות ידניות בלבד' },
]

const parseUrgency = (value: string): WorkQueueUrgency | null => {
  const result = z.enum(workQueueUrgencyValues).safeParse(value)
  return result.success ? result.data : null
}

const parseSourceType = (value: string): WorkQueueSourceType | null => {
  const result = z.enum(workQueueSourceTypeValues).safeParse(value)
  return result.success ? result.data : null
}

const parseTaskStatus = (value: string): TaskStatus | null => {
  const result = z.enum(taskStatusValues).safeParse(value)
  return result.success ? result.data : null
}

const parseLinked = (value: string): 'linked' | 'unlinked' | null => {
  const result = z.enum(['linked', 'unlinked'] as const).safeParse(value)
  return result.success ? result.data : null
}

const parseScope = (value: string): 'system' | 'manual' | null => {
  const result = z.enum(['system', 'manual'] as const).safeParse(value)
  return result.success ? result.data : null
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
}) => (
  <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(220px,1fr)_150px_150px_170px_170px_170px_auto]">
    <Input
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="חיפוש לפי לקוח, מספר, כותרת או משימה"
      startIcon={<Search className="h-4 w-4" />}
    />
    <Select
      options={urgencyOptions}
      value={urgencyFilter ?? ''}
      onChange={(e) => onUrgencyChange(parseUrgency(e.target.value))}
    />
    <Select
      options={typeOptions}
      value={typeFilter ?? ''}
      onChange={(e) => onTypeChange(parseSourceType(e.target.value))}
    />
    <Select
      options={statusOptions}
      value={statusFilter ?? ''}
      onChange={(e) => onStatusChange(parseTaskStatus(e.target.value))}
    />
    <Select
      options={linkedOptions}
      value={linkedFilter ?? ''}
      onChange={(e) => onLinkedChange(parseLinked(e.target.value))}
    />
    <Select
      options={scopeOptions}
      value={scopeFilter ?? ''}
      onChange={(e) => onScopeChange(parseScope(e.target.value))}
    />
    <Button variant={historyMode ? 'secondary' : 'ghost'} size="sm" onClick={() => onHistoryModeChange(!historyMode)}>
      היסטוריה
    </Button>
    {hasFilters && (
      <Button variant="ghost" size="sm" onClick={onClear}>
        אפס סינון
      </Button>
    )}
  </div>
)
