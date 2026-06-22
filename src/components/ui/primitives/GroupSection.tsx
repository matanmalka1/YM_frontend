import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/utils'
import { Badge } from './Badge'

interface GroupSectionProps {
  label: ReactNode
  count?: number
  countLabel?: string
  meta?: ReactNode
  children: ReactNode
  defaultExpanded?: boolean
  collapsible?: boolean
  className?: string
}

export const GroupSection = ({
  label,
  count,
  countLabel,
  meta,
  children,
  defaultExpanded = true,
  collapsible = false,
  className,
}: GroupSectionProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <section className={cn('overflow-hidden rounded-xl border border-gray-200 bg-white', className)}>
      <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{label}</span>
          {count !== undefined && (
            <Badge variant="neutral" size="xs" className="px-2 text-gray-600">
              {count}
              {countLabel ? ` ${countLabel}` : ''}
            </Badge>
          )}
          {meta && <span className="flex flex-wrap items-center gap-1.5">{meta}</span>}
        </div>
        {collapsible && (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label={expanded ? 'קפל' : 'פתח'}
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', !expanded && '-rotate-90')} />
          </button>
        )}
      </header>
      {expanded && <div>{children}</div>}
    </section>
  )
}

GroupSection.displayName = 'GroupSection'
