import { Badge, type BadgeSize, type BadgeVariant } from './Badge'
import { makeVariantGetter } from '@/utils/labels'

export type StatusBadgeVariantMap = Record<string, BadgeVariant>

interface StatusBadgeProps {
  status: string
  getLabel: (status: string) => string
  variantMap: StatusBadgeVariantMap
  defaultVariant?: BadgeVariant
  size?: BadgeSize
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  getLabel,
  variantMap,
  defaultVariant = 'neutral',
  size,
  className,
}) => {
  const label = getLabel(status)
  const variant = makeVariantGetter(variantMap, defaultVariant)(status)
  return (
    <Badge variant={variant} size={size} className={className}>
      {label}
    </Badge>
  )
}
