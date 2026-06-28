import { Badge, type BadgeSize, type BadgeVariant } from './Badge'
import { makeVariantGetter } from '@/utils/labels'

export type StatusBadgeVariantMap = Record<string, BadgeVariant>

interface StatusBadgeProps<TStatus extends string> {
  status: TStatus
  getLabel: (status: TStatus) => string
  variantMap: StatusBadgeVariantMap
  defaultVariant?: BadgeVariant
  size?: BadgeSize
  className?: string
}

export const StatusBadge = <TStatus extends string>({
  status,
  getLabel,
  variantMap,
  defaultVariant = 'neutral',
  size,
  className,
}: StatusBadgeProps<TStatus>) => {
  const label = getLabel(status)
  const variant = makeVariantGetter(variantMap, defaultVariant)(status)
  return (
    <Badge variant={variant} size={size} className={className}>
      {label}
    </Badge>
  )
}
