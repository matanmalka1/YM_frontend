import { useQuery } from '@tanstack/react-query'
import { reportsApi, reportsQK } from '../api'
import { getTotalPages } from '@/utils/paginationUtils'
import { PAGE_SIZE_MD as PAGE_SIZE } from '@/constants/pagination.constants'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { getErrorMessage } from '@/utils/utils'
import { REPORTS_ERROR_MESSAGES } from '../errorMessages'
import { parseReportYear } from '../utils/urlState'

export const useVatComplianceReport = () => {
  const { getParam, getPage, setFilter, setPage } = useSearchParamFilters()
  const year = parseReportYear(getParam('year'))
  const page = getPage()

  const { data, isLoading, error } = useQuery({
    queryKey: reportsQK.vatCompliance(year, page, PAGE_SIZE),
    queryFn: () => reportsApi.getVatComplianceReport(year, page, PAGE_SIZE),
  })

  const totalPages = data ? getTotalPages(data.total, PAGE_SIZE) : 1

  const handleYearChange = (newYear: number) => {
    setFilter('year', String(newYear))
  }

  return {
    year,
    setYear: handleYearChange,
    page,
    setPage,
    totalPages,
    data,
    isLoading,
    error: error ? getErrorMessage(error, REPORTS_ERROR_MESSAGES.common.loadError) : null,
  }
}
