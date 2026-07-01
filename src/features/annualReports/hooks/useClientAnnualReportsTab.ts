import { useQuery } from '@tanstack/react-query'
import { annualReportsApi, annualReportsQK } from '../api'
import { getErrorMessage } from '../../../utils/utils'
import { ANNUAL_REPORTS_COMPLETE_LIST_PARAMS } from '../constants/reportConstants'
import { ANNUAL_REPORTS_ERROR_MESSAGES } from '../errorMessages'

export const useClientAnnualReportsTab = (clientId: number) => {
  const { data, isPending, error } = useQuery({
    queryKey: annualReportsQK.forClient(clientId),
    queryFn: () => annualReportsApi.listClientReports(clientId, ANNUAL_REPORTS_COMPLETE_LIST_PARAMS),
  })

  return {
    allReports: data ?? [],
    isPending,
    errorMessage: error ? getErrorMessage(error, ANNUAL_REPORTS_ERROR_MESSAGES.reports.clientListLoad) : null,
  }
}
