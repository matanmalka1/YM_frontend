import { useQuery } from '@tanstack/react-query'
import { annualReportsApi, annualReportsQK } from '../api'
import { useReportMutations } from './useReportMutations'
import { useReportSchedules } from './useReportSchedules'
import { ANNUAL_REPORTS_ERROR_MESSAGES } from '../errorMessages'

export const useReportDetail = (reportId: number | null, onDeleted?: () => void) => {
  const reportQuery = useQuery({
    queryKey: annualReportsQK.detail(reportId ?? 0),
    queryFn: () => {
      if (reportId === null) throw new Error('A report ID is required')
      return annualReportsApi.getReport(reportId)
    },
    enabled: reportId !== null && reportId > 0,
    retry: false,
  })

  const schedules = useReportSchedules(reportId)
  const mutations = useReportMutations(reportId, onDeleted)

  return {
    report: reportQuery.data ?? null,
    isLoading: reportQuery.isPending,
    error: reportQuery.error ? ANNUAL_REPORTS_ERROR_MESSAGES.reports.load : null,
    transition: mutations.transition,
    isTransitioning: mutations.isTransitioning,
    completeSchedule: schedules.completeSchedule,
    addSchedule: schedules.addSchedule,
    isCompletingSchedule: schedules.isCompletingSchedule,
    isAddingSchedule: schedules.isAddingSchedule,
    updateDetail: mutations.updateDetail,
    isUpdating: mutations.isUpdating,
    deleteReport: mutations.deleteReport,
    isDeleting: mutations.isDeleting,
  }
}
