import { cn } from '../../../utils/utils'

/* ─── Timeline wrapper ───────────────────────────────────────── */

interface TimelineProps {
  children: React.ReactNode
  className?: string
}

export const Timeline: React.FC<TimelineProps> = ({ children, className }) => (
  <div className={cn('relative', className)}>
    <div className="absolute right-4 top-2 bottom-2 w-0.5 bg-gray-200" />
    <ul className="space-y-4">{children}</ul>
  </div>
)

Timeline.displayName = 'Timeline'

/* ─── Timeline entry ─────────────────────────────────────────── */

interface TimelineEntryProps {
  children: React.ReactNode
  animationDelay?: string
  className?: string
}

export const TimelineEntry: React.FC<TimelineEntryProps> = ({ children, animationDelay, className }) => (
  <li className={cn('relative pr-10 animate-fade-in', className)} style={animationDelay ? { animationDelay } : undefined}>
    <div className="absolute right-2.5 top-1.5 h-3 w-3 rounded-full bg-primary-500 ring-2 ring-white" />
    <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm hover:shadow-md transition-shadow">{children}</div>
  </li>
)

TimelineEntry.displayName = 'TimelineEntry'
