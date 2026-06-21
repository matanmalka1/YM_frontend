import { cn } from '@/utils/utils'
import { SectionHeader } from './SectionHeader'

interface DetailTabPanelProps {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  summary?: React.ReactNode
  filters?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  contentClassName?: string
}

export const DetailTabPanel: React.FC<DetailTabPanelProps> = ({
  title,
  subtitle,
  actions,
  summary,
  filters,
  children,
  footer,
  className,
  contentClassName,
}) => (
  <section className={cn('space-y-4', className)}>
    {(title || subtitle || actions) && (
      <SectionHeader title={title} subtitle={subtitle} actions={actions} size="sm" border="bottom" />
    )}
    {summary}
    {filters}
    <div className={cn('min-w-0 space-y-4', contentClassName)}>{children}</div>
    {footer}
  </section>
)

DetailTabPanel.displayName = 'DetailTabPanel'
