import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsApi, reportsQK, type ExportFormat } from '../api'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { getErrorMessage, showErrorToast } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { REPORTS_MESSAGES } from '../messages'
import { REPORTS_ERROR_MESSAGES } from '../errorMessages'
import { parseReportMonth, parseReportYear } from '../utils/urlState'

export const useAdvancePaymentReport = () => {
  const { getParam, setFilter } = useSearchParamFilters()
  const year = parseReportYear(getParam('year'))
  const month = parseReportMonth(getParam('month'))
  const [exporting, setExporting] = useState<ExportFormat | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: reportsQK.advancePayments(year, month),
    queryFn: () => reportsApi.getAdvancePaymentReport(year, month),
  })

  const handleExport = async (format: ExportFormat) => {
    setExporting(format)
    try {
      const result = await reportsApi.exportAdvancePaymentReport(format, year, month)
      toast.success(REPORTS_MESSAGES.actions.exportSuccess(result.filename))
    } catch (error) {
      showErrorToast(error, REPORTS_ERROR_MESSAGES.actions.exportError)
    } finally {
      setExporting(null)
    }
  }

  return {
    year,
    setYear: (value: number) => setFilter('year', String(value)),
    month,
    setMonth: (value?: number) => setFilter('month', value ? String(value) : ''),
    exporting,
    handleExport,
    data,
    isLoading,
    error: error ? getErrorMessage(error, REPORTS_ERROR_MESSAGES.common.loadError) : null,
  }
}
