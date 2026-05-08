import { useQuery } from '@tanstack/react-query'
import { getYear } from 'date-fns'
import { taxDashboardApi, taxDashboardQK } from '../api'
import type { TaxSubmissionWidgetResponse } from '../api'

export interface TaxDashboardData {
  currentYear: number
  submissions: TaxSubmissionWidgetResponse | undefined
  isLoading: boolean
  hasError: boolean
}

export const useTaxDashboard = (): TaxDashboardData => {
  const currentYear = getYear(new Date())

  const submissionsQuery = useQuery({
    queryKey: taxDashboardQK.submissions(currentYear),
    queryFn: () => taxDashboardApi.getTaxSubmissionsWidget(currentYear),
  })

  return {
    currentYear,
    submissions: submissionsQuery.data,
    isLoading: submissionsQuery.isPending,
    hasError: Boolean(submissionsQuery.error),
  }
}
