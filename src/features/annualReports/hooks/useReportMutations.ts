import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { annualReportsApi, annualReportsQK, type StatusTransitionPayload, type ReportDetailResponse } from '../api'
import { annualReportStatusApi } from '../api'
import { showErrorToast } from '../../../utils/utils'
import { toast } from '../../../utils/toast'
import { timelineQK } from '@/features/timeline'
import type { AnnualReportDetail } from '../types'

export const useReportMutations = (reportId: number | null, onDeleted?: () => void) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const enabled = reportId !== null && reportId > 0
  const queryKey = annualReportsQK.detail(reportId ?? 0)
  const qk = enabled ? queryKey : null

  const transitionMutation = useMutation({
    mutationFn: (payload: StatusTransitionPayload) => {
      if (payload.status === 'submitted') {
        return annualReportStatusApi.submitReport(reportId as number, {
          note: payload.note ?? undefined,
          ita_reference: payload.ita_reference ?? undefined,
          submission_method: payload.submission_method ?? undefined,
        })
      }
      return annualReportStatusApi.transitionStatus(reportId as number, payload)
    },
    onMutate: async (payload) => {
      if (!qk) return
      await queryClient.cancelQueries({ queryKey: qk })
      const previous = queryClient.getQueryData<AnnualReportDetail>(qk)
      queryClient.setQueryData<AnnualReportDetail>(qk, (prev) =>
        prev ? { ...prev, status: payload.status as AnnualReportDetail['status'] } : prev,
      )
      return { previous }
    },
    onError: (err, _payload, context) => {
      if (qk && context?.previous) {
        queryClient.setQueryData(qk, context.previous)
      }
      showErrorToast(err, 'שגיאה בעדכון סטטוס')
    },
    onSuccess: () => {
      toast.success('סטטוס עודכן בהצלחה')
      if (qk) void queryClient.invalidateQueries({ queryKey: qk })
      void queryClient.invalidateQueries({ queryKey: annualReportsQK.all })
      void queryClient.invalidateQueries({ queryKey: timelineQK.all })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<ReportDetailResponse>) =>
      annualReportsApi.patchReportDetails(reportId as number, payload),
    onSuccess: (updated) => {
      toast.success('דוח עודכן בהצלחה')
      if (qk) {
        queryClient.setQueryData<AnnualReportDetail>(qk, (prev) =>
          prev
            ? {
                ...prev,
                client_approved_at: updated.client_approved_at,
                internal_notes: updated.internal_notes,
              }
            : prev,
        )
      }
      void queryClient.invalidateQueries({ queryKey: annualReportsQK.lists() })
    },
    onError: (err) => showErrorToast(err, 'שגיאה בעדכון דוח'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => annualReportsApi.deleteReport(reportId as number),
    onSuccess: async () => {
      toast.success('הדוח נמחק בהצלחה')
      await queryClient.invalidateQueries({ queryKey: annualReportsQK.all })
      if (onDeleted) {
        onDeleted()
      } else {
        navigate('/tax/reports')
      }
    },
    onError: (err) => showErrorToast(err, 'שגיאה במחיקת דוח'),
  })

  return {
    transition: (payload: StatusTransitionPayload) => transitionMutation.mutate(payload),
    isTransitioning: transitionMutation.isPending,
    updateDetail: (payload: Partial<ReportDetailResponse>) => updateMutation.mutate(payload),
    isUpdating: updateMutation.isPending,
    deleteReport: () => deleteMutation.mutateAsync(),
    isDeleting: deleteMutation.isPending,
  }
}
