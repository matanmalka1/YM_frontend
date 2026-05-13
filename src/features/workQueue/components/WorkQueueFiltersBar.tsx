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
import type { WorkQueueUrgency } from '../api/contracts'

interface WorkQueueFiltersBarProps {
  search: string
  onSearchChange: (value: string) => void
  urgencyFilter: WorkQueueUrgency | null
  onUrgencyChange: (value: WorkQueueUrgency | null) => void
  typeFilter: string | null
  onTypeChange: (value: string | null) => void
  linkedFilter: 'linked' | 'unlinked' | null
  onLinkedChange: (value: 'linked' | 'unlinked' | null) => void
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

export const WorkQueueFiltersBar: React.FC<WorkQueueFiltersBarProps> = ({
  search,
  onSearchChange,
  urgencyFilter,
  onUrgencyChange,
  typeFilter,
  onTypeChange,
  linkedFilter,
  onLinkedChange,
  hasFilters,
  onClear,
}) => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(220px,1fr)_180px_180px_190px_auto]">
    <Input
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="חיפוש לפי לקוח, מספר, כותרת או משימה"
      startIcon={<Search className="h-4 w-4" />}
    />
    <Select
      options={urgencyOptions}
      value={urgencyFilter ?? ''}
      onChange={(e) => onUrgencyChange((e.target.value || null) as WorkQueueUrgency | null)}
    />
    <Select
      options={typeOptions}
      value={typeFilter ?? ''}
      onChange={(e) => onTypeChange(e.target.value || null)}
    />
    <Select
      options={linkedOptions}
      value={linkedFilter ?? ''}
      onChange={(e) => onLinkedChange((e.target.value || null) as 'linked' | 'unlinked' | null)}
    />
    {hasFilters && (
      <Button variant="ghost" size="sm" onClick={onClear}>
        אפס סינון
      </Button>
    )}
  </div>
)
