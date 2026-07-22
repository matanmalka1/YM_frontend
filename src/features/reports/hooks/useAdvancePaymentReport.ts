import { useQuery } from '@tanstack/react-query'
import { reportsApi, reportsQK } from '../api'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { getErrorMessage } from '@/utils/utils'
import { REPORTS_ERROR_MESSAGES } from '../errorMessages'
import { parseReportMonth, parseReportYear } from '../utils/urlState'

export const useAdvancePaymentReport = () => {
  const { getParam, setFilter } = useSearchParamFilters()
  const year = parseReportYear(getParam('year'))
  const month = parseReportMonth(getParam('month'))

  const { data, isLoading, error } = useQuery({
    queryKey: reportsQK.advancePayments(year, month),
    queryFn: () => reportsApi.getAdvancePaymentReport(year, month),
  })

  return {
    year,
    setYear: (value: number) => setFilter('year', String(value)),
    month,
    setMonth: (value?: number) => setFilter('month', value ? String(value) : ''),
    data,
    isLoading,
    error: error ? getErrorMessage(error, REPORTS_ERROR_MESSAGES.common.loadError) : null,
  }
}
