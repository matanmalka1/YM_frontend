import type { ReactNode } from 'react'
import { Alert } from '../overlays/Alert'
import { DataTable, type DataTableProps } from './DataTable'
import { getTotalPages } from '../../../utils/paginationUtils'
import { PaginationCard } from './PaginationCard'

type BasePaginatedDataTableProps<T> = Pick<
  DataTableProps<T>,
  | 'className'
  | 'columns'
  | 'data'
  | 'density'
  | 'emptyMessage'
  | 'emptyState'
  | 'getRowKey'
  | 'maxHeight'
  | 'onRetry'
  | 'onRowClick'
  | 'rowClassName'
  | 'stickyHeader'
  | 'surface'
>

export interface PaginatedDataTableProps<T> extends BasePaginatedDataTableProps<T> {
  error?: string | null
  isLoading?: boolean
  /** Background refetch flag. When true, the empty state is suppressed to avoid flicker between pages. */
  isFetching?: boolean
  label?: string
  onPageChange: (page: number) => void
  page: number
  pageSize: number
  /** Custom empty render, used in place of DataTable's emptyState when there are no rows. Lets callers branch on multiple empty variants. */
  renderEmpty?: () => ReactNode
  showPagination?: boolean
  summary?: ReactNode
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
  maxHeight,
  onPageChange,
  onRetry,
  onRowClick,
  page,
  pageSize,
  renderEmpty,
  rowClassName,
  showPagination,
  stickyHeader,
  summary,
  surface,
  density,
  total,
}: PaginatedDataTableProps<T>) => {
  const shouldShowPagination = showPagination ?? (!isLoading && total > 0 && data.length > 0)
  const isEmpty = !isLoading && data.length === 0
  const shouldShowErrorOnly = Boolean(error) && isEmpty
  // While a background refetch holds an empty list, suppress every empty state
  // (custom renderEmpty AND DataTable's own) so the page doesn't flash empty between pages.
  const suppressEmpty = isFetching && isEmpty
  const showCustomEmpty = Boolean(renderEmpty) && isEmpty && !suppressEmpty && !shouldShowErrorOnly

  return (
    <>
      {error && <Alert variant="error" message={error} onRetry={onRetry} />}
      {summary}
      {showCustomEmpty ? (
        renderEmpty?.()
      ) : suppressEmpty || shouldShowErrorOnly ? null : (
        <DataTable
          data={data}
          columns={columns}
          error={error}
          getRowKey={getRowKey}
          onRetry={onRetry}
          onRowClick={onRowClick}
          className={className}
          emptyMessage={emptyMessage}
          isLoading={isLoading}
          rowClassName={rowClassName}
          emptyState={emptyState}
          stickyHeader={stickyHeader}
          maxHeight={maxHeight}
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
