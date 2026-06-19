import { useQuery } from '@tanstack/react-query'
import { annualReportFinancialsApi, annualReportsQK, annualReportTaxApi } from '../api'
import { getProfitSummary } from '../utils/financialHelpers'

export const useAnnualPLSummary = (reportId: number) => {
  const { data: financialsData, isLoading: financialsLoading } = useQuery({
    queryKey: annualReportsQK.financials(reportId),
    queryFn: () => annualReportFinancialsApi.getFinancials(reportId),
    enabled: reportId > 0,
  })

  const { data: taxData, isLoading: taxLoading } = useQuery({
    queryKey: annualReportsQK.taxCalc(reportId),
    queryFn: () => annualReportTaxApi.getTaxCalculation(reportId),
    enabled: reportId > 0,
  })

  return {
    isLoading: financialsLoading || taxLoading,
    summary: financialsData && taxData ? getProfitSummary(financialsData, taxData) : null,
  }
}
