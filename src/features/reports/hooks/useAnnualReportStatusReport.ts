import { useQuery } from '@tanstack/react-query'
import { reportsApi, reportsQK } from '../api'
import { getErrorMessage } from '../../../utils/utils'
import { REPORTS_ERROR_MESSAGES } from '../errorMessages'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { parseReportYear } from '../utils/urlState'

export const useAnnualReportStatusReport = () => {
  const { getParam, setFilter } = useSearchParamFilters()
  const taxYear = parseReportYear(getParam('year'))

  const { data, isPending, error } = useQuery({
    queryKey: reportsQK.annualReportStatus(taxYear),
    queryFn: () => reportsApi.getAnnualReportStatusReport(taxYear),
  })

  return {
    taxYear,
    setTaxYear: (value: number) => setFilter('year', String(value)),
    data,
    isLoading: isPending,
    error: error ? getErrorMessage(error, REPORTS_ERROR_MESSAGES.common.loadError) : null,
  }
}
