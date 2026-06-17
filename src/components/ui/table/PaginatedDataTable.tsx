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
  | 'emptyMessage'
  | 'emptyState'
  | 'getRowKey'
  | 'onRowClick'
  | 'rowClassName'
  | 'stickyHeader'
>

export interface PaginatedDataTableProps<T> extends BasePaginatedDataTableProps<T> {
  error?: string | null
  isLoading?: boolean
  /** Background refetch flag. When true, the empty state is suppressed to avoid flicker between pages. */
  isFetching?: boolean
  label?: string
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  page: number
  pageSize: number
  pageSizeOptions?: number[]
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
  onPageChange,
  onRowClick,
  page,
  pageSize,
  renderEmpty,
  rowClassName,
  showPagination,
  stickyHeader,
  summary,
  total,
}: PaginatedDataTableProps<T>) => {
  const shouldShowPagination = showPagination ?? (!isLoading && total > 0 && data.length > 0)
  const isEmpty = !isLoading && data.length === 0
  // While a background refetch holds an empty list, suppress every empty state
  // (custom renderEmpty AND DataTable's own) so the page doesn't flash empty between pages.
  const suppressEmpty = isFetching && isEmpty
  const showCustomEmpty = Boolean(renderEmpty) && isEmpty && !suppressEmpty

  return (
    <>
      {error && <Alert variant="error" message={error} />}
      {summary}
      {showCustomEmpty ? (
        renderEmpty?.()
      ) : suppressEmpty ? null : (
        <DataTable
          data={data}
          columns={columns}
          getRowKey={getRowKey}
          onRowClick={onRowClick}
          className={className}
          emptyMessage={emptyMessage}
          isLoading={isLoading}
          rowClassName={rowClassName}
          emptyState={emptyState}
          stickyHeader={stickyHeader}
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
