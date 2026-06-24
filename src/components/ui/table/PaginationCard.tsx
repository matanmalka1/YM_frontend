import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '../primitives/Card'
import { cn, formatCount } from '../../../utils/utils'
import { GLOBAL_UI_MESSAGES } from '../../../messages'

interface PaginationCardProps {
  page: number
  totalPages: number
  total: number
  label?: string
  onPageChange: (nextPage: number) => void
}

const getVisiblePages = (page: number, totalPages: number): Array<number | 'ellipsis'> => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set([1, totalPages, page - 1, page, page + 1].filter((value) => value >= 1 && value <= totalPages))
  const orderedPages = Array.from(pages).sort((a, b) => a - b)
  const visiblePages: Array<number | 'ellipsis'> = []

  orderedPages.forEach((value, index) => {
    const previous = orderedPages[index - 1]
    if (previous && value - previous > 1) {
      visiblePages.push('ellipsis')
    }
    visiblePages.push(value)
  })

  return visiblePages
}

export const PaginationCard: React.FC<PaginationCardProps> = ({
  page,
  totalPages,
  total,
  label = GLOBAL_UI_MESSAGES.common.results,
  onPageChange,
}) => {
  const visiblePages = getVisiblePages(page, totalPages)

  return (
    <Card className="mt-4">
      <div className="flex flex-col gap-4 text-sm md:flex-row md:items-center md:justify-between">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-900">{formatCount(total)}</span> {label}
          <span className="mx-2 text-gray-300">|</span>
          עמוד {page} מתוך {totalPages}
        </p>
        <nav className="flex items-center gap-1" aria-label={GLOBAL_UI_MESSAGES.pagination.nav}>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-disabled={page <= 1}
            aria-label={GLOBAL_UI_MESSAGES.pagination.previousPage}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1 px-1">
            {visiblePages.map((visiblePage, index) =>
              visiblePage === 'ellipsis' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="inline-flex h-9 w-9 items-center justify-center text-gray-400"
                  aria-hidden="true"
                >
                  ...
                </span>
              ) : (
                <button
                  key={visiblePage}
                  type="button"
                  className={cn(
                    'inline-flex h-9 w-9 items-center justify-center rounded-md font-semibold tabular-nums',
                    visiblePage === page
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'border border-transparent text-gray-600 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900',
                  )}
                  onClick={() => onPageChange(visiblePage)}
                  disabled={visiblePage === page}
                  aria-current={visiblePage === page ? 'page' : undefined}
                  aria-label={`עמוד ${visiblePage}`}
                >
                  {visiblePage}
                </button>
              ),
            )}
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-disabled={page >= totalPages}
            aria-label={GLOBAL_UI_MESSAGES.pagination.nextPage}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </Card>
  )
}
