import { cn } from '../../../utils/utils'
import { TableSkeleton } from '../table'
import { GLOBAL_UI_MESSAGES } from '../../../messages'

interface PageLoadingProps {
  message?: string
  rows?: number
  columns?: number
  className?: string
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = GLOBAL_UI_MESSAGES.common.loadingData,
  rows = 3,
  columns = 4,
  className,
}) => {
  return (
    <div className={cn('space-y-4 py-12', className)}>
      <TableSkeleton rows={rows} columns={columns} className="mx-auto max-w-4xl" />
      <p className="text-center text-sm text-gray-500">{message}</p>
    </div>
  )
}
