import { useState } from 'react'
import { format as formatDate } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { reportsApi, reportsQK, type ExportFormat } from '../api'
import { getErrorMessage, showErrorToast } from '../../../utils/utils'
import { getTotalPages } from '@/utils/paginationUtils'
import { toast } from '../../../utils/toast'
import { PAGE_SIZE_MD as PAGE_SIZE } from '@/constants/pagination.constants'
import { REPORTS_MESSAGES } from '../messages'
import { REPORTS_ERROR_MESSAGES } from '../errorMessages'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { parseReportDate } from '../utils/urlState'

export const useAgingReport = () => {
  const { getParam, getPage, setFilter, setPage } = useSearchParamFilters()
  const today = formatDate(new Date(), 'yyyy-MM-dd')
  const asOfDate = parseReportDate(getParam('date'), today)
  const page = getPage()
  const [exporting, setExporting] = useState<ExportFormat | null>(null)

  const setAsOfDate = (value: string) => {
    setFilter('date', value)
  }

  const { data, isPending, error } = useQuery({
    queryKey: reportsQK.aging(asOfDate, page, PAGE_SIZE),
    queryFn: () => reportsApi.getAgingReport(asOfDate, page, PAGE_SIZE),
  })

  const totalPages = data ? getTotalPages(data.total, PAGE_SIZE) : 1

  const handleExport = async (format: ExportFormat) => {
    setExporting(format)
    try {
      const result = await reportsApi.exportAgingReport(format, asOfDate)
      toast.success(REPORTS_MESSAGES.actions.exportSuccess(result.filename))
    } catch (error) {
      showErrorToast(error, REPORTS_ERROR_MESSAGES.actions.exportError)
    } finally {
      setExporting(null)
    }
  }

  return {
    asOfDate,
    setAsOfDate,
    page,
    setPage,
    totalPages,
    exporting,
    handleExport,
    data,
    isLoading: isPending,
    error: error ? getErrorMessage(error, REPORTS_ERROR_MESSAGES.common.loadError) : null,
  }
}
