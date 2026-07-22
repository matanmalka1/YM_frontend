import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  annualReportsApi,
  annualReportsQK,
  type AnnualReportDetailUpdatePayload,
  type AnnualReportFull,
  type StatusTransitionPayload,
} from '../api'
import { annualReportStatusApi } from '../api'
import { showErrorToast } from '../../../utils/utils'
import { toast } from '../../../utils/toast'
import { ANNUAL_REPORTS_ERROR_MESSAGES } from '../errorMessages'

export const useReportMutations = (reportId: number | null, onDeleted?: () => void) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const enabled = reportId !== null && reportId > 0
  const queryKey = annualReportsQK.detail(reportId ?? 0)
  const qk = enabled ? queryKey : null

  const transitionMutation = useMutation({
    mutationFn: async (payload: StatusTransitionPayload): Promise<void> => {
      if (payload.status === 'submitted') {
        await annualReportStatusApi.submitReport(reportId as number, {
          note: payload.note ?? undefined,
          ita_reference: payload.ita_reference ?? undefined,
          submission_method: payload.submission_method ?? undefined,
        })
        return
      }
      await annualReportStatusApi.transitionStatus(reportId as number, payload)
    },
    onMutate: async (payload) => {
      if (!qk) return
      await queryClient.cancelQueries({ queryKey: qk })
      const previous = queryClient.getQueryData<AnnualReportFull>(qk)
      queryClient.setQueryData<AnnualReportFull>(qk, (prev) =>
        prev ? { ...prev, status: payload.status as AnnualReportFull['status'] } : prev,
      )
      return { previous }
    },
    onError: (err, _payload, context) => {
      if (qk && context?.previous) {
        queryClient.setQueryData(qk, context.previous)
      }
      showErrorToast(err, ANNUAL_REPORTS_ERROR_MESSAGES.reports.statusUpdate)
    },
    onSuccess: () => {
      toast.success('סטטוס עודכן בהצלחה')
      if (qk) void queryClient.invalidateQueries({ queryKey: qk })
      void queryClient.invalidateQueries({ queryKey: annualReportsQK.all })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: AnnualReportDetailUpdatePayload) => annualReportsApi.patchReportDetails(reportId as number, payload),
    onSuccess: (updated) => {
      toast.success('דוח עודכן בהצלחה')
      if (qk) {
        queryClient.setQueryData<AnnualReportFull>(qk, (prev) =>
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
    onError: (err) => showErrorToast(err, ANNUAL_REPORTS_ERROR_MESSAGES.reports.update),
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
    onError: (err) => showErrorToast(err, ANNUAL_REPORTS_ERROR_MESSAGES.reports.delete),
  })

  return {
    transition: (payload: StatusTransitionPayload) => transitionMutation.mutate(payload),
    isTransitioning: transitionMutation.isPending,
    updateDetail: (payload: AnnualReportDetailUpdatePayload) => updateMutation.mutate(payload),
    isUpdating: updateMutation.isPending,
    deleteReport: () => deleteMutation.mutateAsync(),
    isDeleting: deleteMutation.isPending,
  }
}
