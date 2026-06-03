import { cn } from '../../../utils/utils'

interface SectionHeaderProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  /**
   * xs  — DrawerSection label (uppercase, tracking-wide)
   * sm  — Card header
   * md  — Compact page header (h2, bold, text-xl)
   * lg  — PageHeader (h1, bold)
   */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  border?: 'bottom' | 'none'
  className?: string
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actions,
  size = 'sm',
  border = 'none',
  className,
}) => (
  <div
    className={cn(
      'flex items-start justify-between gap-4',
      border === 'bottom' && 'border-b border-gray-100/80 pb-3',
      className,
    )}
  >
    <div>
      {size === 'lg' ? (
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black" style={{ fontFamily: 'var(--font-display)' }}>{title}</h1>
      ) : size === 'md' ? (
        <h2 className="text-xl font-bold tracking-tight text-gray-900">{title}</h2>
      ) : size === 'xs' ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      ) : (
        <h3 className="text-lg font-semibold text-gray-900 tracking-tight">{title}</h3>
      )}
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

SectionHeader.displayName = 'SectionHeader'
