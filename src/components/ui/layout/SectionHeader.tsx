import { cn } from '../../../utils/utils'

interface SectionHeaderProps {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  /** Optional icon rendered inline before the title (e.g. a lucide icon). */
  icon?: React.ReactNode
  /**
   * xs    — DrawerSection label (uppercase, tracking-wide)
   * sm    — Card header
   * md    — Compact page header (bold, text-xl)
   * lg    — PageHeader (bold)
   * panel — Dense panel-card header: title stacked over subtitle beside the
   *         icon, both truncated. Pass headingLevel explicitly at the
   *         composition point.
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'panel'
  /**
   * Heading level is document structure, size is looks — a compact page header
   * must still be the page's h1. Defaults follow size (lg→h1, md→h2, sm/panel→h3).
   */
  headingLevel?: 1 | 2 | 3
  border?: 'bottom' | 'none'
  className?: string
}

const titleClasses = {
  lg: 'font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-black md:text-3xl',
  md: 'text-xl font-bold tracking-tight text-gray-900',
  sm: 'text-lg font-semibold text-gray-900 tracking-tight',
  xs: 'text-xs font-semibold uppercase tracking-wide text-gray-400',
  panel: 'truncate text-sm font-bold text-gray-900',
} as const

const defaultTitleTag = { lg: 'h1', md: 'h2', sm: 'h3', xs: 'p', panel: 'h3' } as const

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actions,
  icon,
  size = 'sm',
  headingLevel,
  border = 'none',
  className,
}) => {
  const TitleTag = (headingLevel ? `h${headingLevel}` : defaultTitleTag[size]) as 'h1' | 'h2' | 'h3' | 'p'

  if (size === 'panel') {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-4',
          border === 'bottom' && 'border-b border-gray-100/80 pb-3',
          className,
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          {icon && <span className="shrink-0">{icon}</span>}
          <div className="min-w-0">
            {title != null && <TitleTag className={titleClasses.panel}>{title}</TitleTag>}
            {subtitle && <div className="mt-0.5 truncate text-xs text-gray-500">{subtitle}</div>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4',
        border === 'bottom' && 'border-b border-gray-100/80 pb-3',
        className,
      )}
    >
      <div className={cn(icon && 'flex items-center gap-2')}>
        {icon && <span className="shrink-0">{icon}</span>}
        {title != null && <TitleTag className={titleClasses[size]}>{title}</TitleTag>}
        {subtitle && (
          <div
            className={cn(
              'text-gray-600',
              size === 'lg' ? 'mt-1.5 text-base md:text-lg max-w-3xl leading-relaxed' : 'mt-1 text-sm',
            )}
          >
            {subtitle}
          </div>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  )
}

SectionHeader.displayName = 'SectionHeader'
