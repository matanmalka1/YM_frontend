import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/utils'
import { semanticStatToneClasses, type SemanticTone } from '@/utils/semanticColors'
import { Badge, type BadgeVariant } from '@/components/ui/primitives/Badge'
import { Card } from '@/components/ui/primitives/Card'

type Tone = SemanticTone | 'purple'

const purpleTone = { iconBg: 'bg-violet-50 text-violet-500' }

const getToneClasses = (tone: Tone) =>
  tone === 'purple' ? purpleTone : semanticStatToneClasses[tone]

const getBadgeVariant = (tone: Tone): BadgeVariant =>
  tone === 'purple' ? 'info' : tone

interface DashboardSurfaceProps {
  children: ReactNode
  className?: string
}

export const DashboardSurface = ({ children, className }: DashboardSurfaceProps) => (
  <div className={cn('space-y-5', className)}>{children}</div>
)

interface DashboardSectionHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  count?: number | string
  action?: ReactNode
  tone?: Tone
  className?: string
}

export const DashboardSectionHeader = ({
  title,
  subtitle,
  icon: Icon,
  count,
  action,
  tone = 'neutral',
  className,
}: DashboardSectionHeaderProps) => (
  <div className={cn('flex items-center justify-between gap-4', className)}>
    <div className="flex min-w-0 items-center gap-3">
      {Icon && (
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl', getToneClasses(tone).iconBg)}>
          <Icon className="h-4 w-4" />
        </span>
      )}
      <div className="min-w-0">
        <h2 className="truncate text-sm font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 truncate text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      {count !== undefined && (
        <Badge variant={getBadgeVariant(tone)} size="sm" className="min-w-7 justify-center tabular-nums">
          {count}
        </Badge>
      )}
      {action}
    </div>
  </div>
)

interface DashboardPanelProps {
  children: ReactNode
  className?: string
}

export const DashboardPanel = ({ children, className }: DashboardPanelProps) => (
  <Card variant="soft" disablePadding className={className}>
    {children}
  </Card>
)
