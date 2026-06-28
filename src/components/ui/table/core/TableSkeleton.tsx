import { Card } from '../../primitives/Card'
import { SkeletonBlock } from '../../primitives/SkeletonBlock'
import { staggerDelay } from '../../../../utils/animation'
import { cn } from '../../../../utils/utils'
import type { TableSurface, TableDensity } from './tableTypes'

export interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
  surface?: TableSurface
  density?: TableDensity
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 6,
  className,
  surface = 'card',
  density = 'default',
}) => {
  const isBare = surface === 'bare'
  const isCompact = density === 'compact'
  const cellPadding = isCompact ? 'px-3 py-1.5' : 'px-3 py-2'
  const table = (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className={cn('border-b border-gray-200 bg-gray-50/80', isBare && 'bg-transparent')}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <th key={colIndex} className={cn(cellPadding, 'first:ps-5 last:pe-5')}>
                <SkeletonBlock shimmer width="w-24" height="h-4" className="mx-auto" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={cn('divide-y divide-gray-200', !isBare && 'bg-white')}>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="group hover:bg-gray-50/50 transition-colors">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className={cn(cellPadding, 'text-center first:ps-5 last:pe-5')}>
                  <SkeletonBlock
                    shimmer
                    width={colIndex === 0 ? 'w-32' : colIndex === columns - 1 ? 'w-20' : 'w-24'}
                    height="h-4"
                    delay={staggerDelay(rowIndex)}
                    className="mx-auto"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  if (isBare) {
    return className ? <div className={className}>{table}</div> : table
  }

  if (surface === 'embedded') {
    return <div className={cn('overflow-hidden rounded-lg border border-gray-100', className)}>{table}</div>
  }

  return (
    <Card className={cn('overflow-hidden', className)} disablePadding>
      {table}
    </Card>
  )
}
