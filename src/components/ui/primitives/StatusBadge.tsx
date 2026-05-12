import { Badge, type BadgeSize, type BadgeVariant } from './Badge'

interface StatusBadgeProps {
  status: string
  getLabel: (status: string) => string
  variantMap: Record<string, BadgeVariant>
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
  const variant = variantMap[status] ?? defaultVariant
  return (
    <Badge variant={variant} size={size} className={className}>
      {label}
    </Badge>
  )
}
