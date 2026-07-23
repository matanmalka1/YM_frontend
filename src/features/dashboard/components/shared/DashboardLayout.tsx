import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/utils'
import type { SemanticTone } from '@/utils/semanticColors'
import { Badge, type BadgeVariant } from '@/components/ui/primitives/Badge'
import { Card } from '@/components/ui/primitives/Card'
import { IconChip } from '@/components/ui/primitives/IconChip'
import { SectionHeader } from '@/components/ui/layout/SectionHeader'

type Tone = SemanticTone | 'purple'

const getBadgeVariant = (tone: Tone): BadgeVariant => (tone === 'purple' ? 'info' : tone)

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

// Thin adapter over SectionHeader's panel variant: converts dashboard tone/count semantics into IconChip + Badge.
export const DashboardSectionHeader = ({
  title,
  subtitle,
  icon: Icon,
  count,
  action,
  tone = 'neutral',
  className,
}: DashboardSectionHeaderProps) => (
  <SectionHeader
    size="panel"
    headingLevel={2}
    title={title}
    subtitle={subtitle}
    icon={Icon && <IconChip icon={Icon} tone={tone} />}
    actions={
      (count !== undefined || action) && (
        <>
          {count !== undefined && (
            <Badge variant={getBadgeVariant(tone)} size="sm" className="min-w-7 justify-center tabular-nums">
              {count}
            </Badge>
          )}
          {action}
        </>
      )
    }
    className={className}
  />
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
