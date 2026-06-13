import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { annualReportsApi, annualReportsQK } from '../api'
import { getErrorMessage } from '../../../utils/utils'
import { CURRENT_YEAR } from '../types'
import { ANNUAL_REPORTS_COMPLETE_LIST_PARAMS } from '../report.constants'

const YEAR_LIST = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3]

export const useClientAnnualReportsTab = (clientId: number) => {
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR)

  const { data, isPending, error } = useQuery({
    queryKey: annualReportsQK.forClient(clientId),
    queryFn: () => annualReportsApi.listClientReports(clientId, ANNUAL_REPORTS_COMPLETE_LIST_PARAMS),
  })

  const allReports = data ?? []
  const selectedReport = allReports.find((r) => r.tax_year === selectedYear) ?? null
  const yearHasReports = (year: number) => allReports.some((r) => r.tax_year === year)

  return {
    selectedYear,
    setSelectedYear,
    allReports,
    selectedReport,
    yearHasReports,
    isPending,
    errorMessage: error ? getErrorMessage(error, 'שגיאה בטעינת דוחות שנתיים') : null,
    YEAR_LIST,
  }
}
