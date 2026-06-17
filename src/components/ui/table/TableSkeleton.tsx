import { Card } from '../primitives/Card'
import { SkeletonBlock } from '../primitives/SkeletonBlock'
import { staggerDelay } from '../../../utils/animation'
import { cn } from '../../../utils/utils'

export interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 6, className }) => (
  <Card className={cn('overflow-hidden', className)} disablePadding>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/80">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <th key={colIndex} className="px-3 py-2 first:ps-5 last:pe-5">
                <SkeletonBlock shimmer width="w-24" height="h-4" className="mx-auto" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="group hover:bg-gray-50/50 transition-colors">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-3 py-2 text-center first:ps-5 last:pe-5">
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
  </Card>
)
