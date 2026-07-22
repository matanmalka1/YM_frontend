import { Alert } from '../../overlays/Alert'
import { DataTable, type DataTableProps } from './DataTable'
import { getTotalPages } from '../../../../utils/paginationUtils'
import { PaginationCard } from '../toolbar/PaginationCard'

/** Every DataTable prop flows through; `isLoading` is re-declared here to drive pagination visibility too. */
type BasePaginatedDataTableProps<T> = Omit<DataTableProps<T>, 'isLoading'>

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
  total: number
}

export const PaginatedDataTable = <T,>({
  data,
  error,
  isLoading = false,
  isFetching = false,
  label,
  onPageChange,
  onRetry,
  page,
  pageSize,
  total,
  ...dataTableProps
}: PaginatedDataTableProps<T>) => {
  const shouldShowPagination = !isLoading && data.length > 0 && total > pageSize
  const isEmpty = !isLoading && data.length === 0
  const shouldShowErrorOnly = Boolean(error) && isEmpty
  // While a background refetch holds an empty list, suppress the empty state
  // so the page doesn't flash empty between pages.
  const suppressEmpty = isFetching && isEmpty

  return (
    <>
      {error && <Alert variant="error" message={error} onRetry={onRetry} />}
      {suppressEmpty || shouldShowErrorOnly ? null : <DataTable {...dataTableProps} data={data} isLoading={isLoading} />}
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
