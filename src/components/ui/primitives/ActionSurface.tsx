import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/utils/utils'

type ActionSurfaceVariant = 'tile' | 'compact' | 'row' | 'plainRow' | 'card' | 'timelineGroup'

interface ActionSurfaceButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionSurfaceVariant
}

interface ActionSurfaceLinkProps extends LinkProps {
  variant?: ActionSurfaceVariant
}

const variantClasses: Record<ActionSurfaceVariant, string> = {
  tile:
    'flex flex-col items-start gap-2.5 rounded-xl border border-transparent bg-slate-50 p-3.5 text-start text-sm font-semibold text-slate-800 transition-all hover:border-primary-200 hover:bg-white hover:shadow-elevation-1',
  compact:
    'flex min-w-0 items-center gap-2 rounded-md px-3 py-2 text-right transition-colors hover:bg-gray-50 disabled:cursor-default disabled:hover:bg-transparent',
  row:
    'flex w-full items-center justify-between gap-3 rounded-lg bg-white/60 px-3 py-2 text-right transition-colors hover:bg-white/90',
  plainRow: 'flex w-full items-center justify-between gap-3 px-3 py-2 text-right transition-colors hover:bg-slate-50',
  card:
    'animate-fade-in rounded-xl border border-gray-200 bg-white p-5 text-right shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
  timelineGroup:
    'inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-200/70',
}

export const ActionSurfaceButton: React.FC<ActionSurfaceButtonProps> = ({
  variant = 'row',
  className,
  type = 'button',
  ...props
}) => (
  <button type={type} className={cn('focus-ring', variantClasses[variant], className)} {...props} />
)

export const ActionSurfaceLink: React.FC<ActionSurfaceLinkProps> = ({ variant = 'tile', className, ...props }) => (
  <Link className={cn('focus-ring', variantClasses[variant], className)} {...props} />
)
