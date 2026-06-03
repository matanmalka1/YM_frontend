import { cn } from '../../../utils/utils'

interface ToolbarContainerProps {
  children: React.ReactNode
  className?: string
}

export const ToolbarContainer: React.FC<ToolbarContainerProps> = ({ children, className }) => (
  <div className={cn('rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3', className)}>{children}</div>
)

ToolbarContainer.displayName = 'ToolbarContainer'
