import { cn } from '../../../utils/utils'

interface ToolbarContainerProps {
  children: React.ReactNode
  className?: string
}

export const ToolbarContainer: React.FC<ToolbarContainerProps> = ({ children, className }) => (
  <div className={cn('rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm', className)}>{children}</div>
)

ToolbarContainer.displayName = 'ToolbarContainer'
