import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/utils'
import { Badge } from './Badge'
import { Button } from './Button'

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
          <Button
            variant="outline"
            shape="square"
            size="sm"
            className="flex-shrink-0"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            icon={<ChevronDown className={cn('h-4 w-4 transition-transform', !expanded && '-rotate-90')} />}
            aria-label={expanded ? 'קפל' : 'פתח'}
          />
        )}
      </header>
      {expanded && <div>{children}</div>}
    </section>
  )
}

GroupSection.displayName = 'GroupSection'
