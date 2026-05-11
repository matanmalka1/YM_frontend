import { Select } from '@/components/ui/inputs/Select'
import { Button } from '@/components/ui/primitives/Button'
import { workQueueSourceTypeLabels, workQueueSourceTypeValues } from '../constants'

interface WorkQueueFiltersBarProps {
  typeFilter: string | null
  onTypeChange: (value: string | null) => void
  hasFilters: boolean
  onClear: () => void
}

const typeOptions = [
  { value: '', label: 'כל הסוגים' },
  ...workQueueSourceTypeValues.map((v) => ({ value: v, label: workQueueSourceTypeLabels[v] })),
]

export const WorkQueueFiltersBar: React.FC<WorkQueueFiltersBarProps> = ({
  typeFilter,
  onTypeChange,
  hasFilters,
  onClear,
}) => (
  <div className="flex items-center gap-3 flex-wrap">
    <Select
      options={typeOptions}
      value={typeFilter ?? ''}
      onChange={(e) => onTypeChange(e.target.value || null)}
      className="w-44"
    />
    {hasFilters && (
      <Button variant="ghost" size="sm" onClick={onClear}>
        אפס סינון
      </Button>
    )}
  </div>
)
