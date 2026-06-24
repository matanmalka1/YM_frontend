import { cn } from '../../../utils/utils'
import { Badge } from '../primitives/Badge'
import { Button } from '../primitives/Button'

export interface FilterBadge {
  key: string
  label: string
  onRemove: () => void
}

interface Props {
  badges: FilterBadge[]
  onReset?: () => void
  withDivider?: boolean
}

export const ActiveFilterBadges: React.FC<Props> = ({ badges, onReset, withDivider }) => {
  if (badges.length === 0) return null
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 animate-fade-in',
        withDivider && 'border-t border-gray-100 pt-3',
      )}
    >
      {withDivider && <span className="text-2xs font-medium text-gray-400">מסננים פעילים</span>}
      {badges.map((b) => (
        <Badge key={b.key} removable onRemove={b.onRemove}>
          {b.label}
        </Badge>
      ))}
      {onReset && (
        <Button type="button" variant="link" size="sm" className="text-2xs" onClick={onReset}>
          נקה הכל
        </Button>
      )}
    </div>
  )
}
