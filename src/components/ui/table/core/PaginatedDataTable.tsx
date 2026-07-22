import { Alert } from '../../overlays/Alert'
import { DataTable, type DataTableProps } from './DataTable'
import { getTotalPages } from '../../../../utils/paginationUtils'
import { PaginationCard } from '../toolbar/PaginationCard'

type BasePaginatedDataTableProps<T> = Pick<
  DataTableProps<T>,
  | 'className'
  | 'columns'
  | 'data'
  | 'density'
  | 'emptyMessage'
  | 'emptyState'
  | 'getRowKey'
  | 'onRowClick'
  | 'getRowVariant'
  | 'surface'
>

export interface PaginatedDataTableProps<T> extends BasePaginatedDataTableProps<T> {
  error?: string | null
  isLoading?: boolean
  /** Background refetch flag. When true, the empty state is suppressed to avoid flicker between pages. */
  isFetching?: boolean
  label?: string
  onPageChange: (page: number) => void
  onRetry?: () => void
  page: number
  pageSize: number
  showPagination?: boolean
  total: number
}

export const PaginatedDataTable = <T,>({
  className,
  columns,
  data,
  emptyMessage,
  emptyState,
  error,
  getRowKey,
  isLoading = false,
  isFetching = false,
  label,
  onPageChange,
  onRetry,
  onRowClick,
  getRowVariant,
  page,
  pageSize,
  showPagination,
  surface,
  density,
  total,
}: PaginatedDataTableProps<T>) => {
  const shouldShowPagination = showPagination ?? (!isLoading && total > 0 && data.length > 0)
  const isEmpty = !isLoading && data.length === 0
  const shouldShowErrorOnly = Boolean(error) && isEmpty
  // While a background refetch holds an empty list, suppress the empty state
  // so the page doesn't flash empty between pages.
  const suppressEmpty = isFetching && isEmpty

  return (
    <>
      {error && <Alert variant="error" message={error} onRetry={onRetry} />}
      {suppressEmpty || shouldShowErrorOnly ? null : (
        <DataTable
          data={data}
          columns={columns}
          getRowKey={getRowKey}
          onRowClick={onRowClick}
          getRowVariant={getRowVariant}
          className={className}
          emptyMessage={emptyMessage}
          isLoading={isLoading}
          emptyState={emptyState}
          surface={surface}
          density={density}
        />
      )}
      {shouldShowPagination && (
        <PaginationCard
          page={page}
          totalPages={getTotalPages(total, pageSize)}
          total={total}
          label={label}
          onPageChange={onPageChange}
        />
      )}
    </>
  )
}
