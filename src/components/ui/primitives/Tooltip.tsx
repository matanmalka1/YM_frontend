import type { ReactNode } from 'react'
import { cn } from '../../../utils/utils'

interface TooltipProps {
  text: string
  children: ReactNode
  className?: string
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, className }) => (
  <div className={cn('group relative inline-flex', className)}>
    {children}
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity delay-500 duration-150 group-hover:opacity-100"
    >
      {text}
    </span>
  </div>
)

Tooltip.displayName = 'Tooltip'
