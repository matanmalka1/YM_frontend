import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  annualReportsApi,
  annualReportsQK,
  type AnnualReportDetailUpdatePayload,
  type AnnualReportFull,
  type StatusTransitionPayload,
} from '../api'
import { annualReportStatusApi } from '../api'
import { showErrorToast } from '../../../utils/utils'
import { toSiblingRecordPath } from '../../../utils/recordPath'
import { toast } from '../../../utils/toast'
import { ANNUAL_REPORTS_ERROR_MESSAGES } from '../errorMessages'
import { ANNUAL_REPORTS_MESSAGES } from '../messages'

export const useReportMutations = (reportId: number | null, onDeleted?: () => void) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { pathname } = useLocation()
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

  // Correcting touches two rows — the new amendment and the report it corrects,
  // which has just gained a `superseded_at` — so the whole key space is
  // invalidated rather than this report's detail key. The chain key lives under
  // it, so the history view refreshes with them.
  //
  // The page then moves to the correction. The report left behind is submitted
  // and locked (D-13), so staying on it leaves the advisor on the one screen
  // where the corrected figures cannot be entered. Pushed rather than replaced:
  // the original still exists, so Back is a real place to go.
  const createAmendmentMutation = useMutation({
    mutationFn: () => annualReportsApi.createAmendment(reportId as number),
    onSuccess: async (amendment) => {
      toast.success(ANNUAL_REPORTS_MESSAGES.fullPanel.amendSuccess)
      await queryClient.invalidateQueries({ queryKey: annualReportsQK.all })
      navigate(toSiblingRecordPath(pathname, amendment.id))
    },
    onError: (err) => showErrorToast(err, ANNUAL_REPORTS_ERROR_MESSAGES.reports.amend),
  })

  // Withdrawing touches two rows — this amendment and the report it corrected —
  // so the whole key space is invalidated rather than this report's detail key.
  //
  // The page cannot stay on the withdrawn amendment: it no longer exists, so the
  // next fetch of this URL answers 404. It replaces the entry rather than pushing
  // one, because Back would land on that same dead URL.
  const withdrawMutation = useMutation({
    mutationFn: () => annualReportsApi.withdrawAmendment(reportId as number),
    onSuccess: async (original) => {
      toast.success(ANNUAL_REPORTS_MESSAGES.fullPanel.withdrawSuccess)
      await queryClient.invalidateQueries({ queryKey: annualReportsQK.all })
      navigate(toSiblingRecordPath(pathname, original.id), { replace: true })
    },
    onError: (err) => showErrorToast(err, ANNUAL_REPORTS_ERROR_MESSAGES.reports.withdraw),
  })

  return {
    transition: (payload: StatusTransitionPayload) => transitionMutation.mutate(payload),
    isTransitioning: transitionMutation.isPending,
    updateDetail: (payload: AnnualReportDetailUpdatePayload) => updateMutation.mutate(payload),
    isUpdating: updateMutation.isPending,
    deleteReport: () => deleteMutation.mutateAsync(),
    isDeleting: deleteMutation.isPending,
    createAmendment: () => createAmendmentMutation.mutateAsync(),
    isCreatingAmendment: createAmendmentMutation.isPending,
    withdrawAmendment: () => withdrawMutation.mutateAsync(),
    isWithdrawing: withdrawMutation.isPending,
  }
}
