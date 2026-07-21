import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { showErrorToast } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { annualReportsApi, annualReportsQK, getAllowedTransitions } from '../api'
import { ANNUAL_REPORTS_ERROR_MESSAGES } from '../errorMessages'
import type { StatusTransitionPanelProps, TransitionForm } from '../types'
import { buildTransitionPayload, getEmptyTransitionForm, isValidAmendReason } from '../utils/statusTransitionHelpers'

export const useStatusTransitionPanel = (
  report: StatusTransitionPanelProps['report'],
  onTransition: StatusTransitionPanelProps['onTransition'],
) => {
  const queryClient = useQueryClient()
  const allowed = getAllowedTransitions(report)
  const [selected, setSelected] = useState<(typeof allowed)[number] | null>(null)
  const [form, setForm] = useState<TransitionForm>(getEmptyTransitionForm)
  const [amendOpen, setAmendOpen] = useState(false)
  const [amendReason, setAmendReason] = useState('')
  const [readinessOpen, setReadinessOpen] = useState(false)

  const closeAmendModal = () => {
    setAmendOpen(false)
    setAmendReason('')
  }

  const amendMutation = useMutation({
    mutationFn: (reason: string) => annualReportsApi.amend(report.id, reason),
    onSuccess: async () => {
      toast.success('דוח נשלח לתיקון')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: annualReportsQK.detail(report.id) }),
        queryClient.invalidateQueries({ queryKey: annualReportsQK.all }),
      ])
      closeAmendModal()
    },
    onError: (error) => showErrorToast(error, ANNUAL_REPORTS_ERROR_MESSAGES.statusTransition.amend),
  })

  const setField = (field: keyof TransitionForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const select = (status: (typeof allowed)[number]) => {
    setSelected((current) => (current === status ? null : status))
    setForm(getEmptyTransitionForm())
  }

  const submitAmend = () => {
    const reason = amendReason.trim()
    if (isValidAmendReason(reason)) amendMutation.mutate(reason)
  }

  const submitTransition = () => {
    if (!selected) return
    onTransition(buildTransitionPayload(selected, form))
    setSelected(null)
    setForm(getEmptyTransitionForm())
  }

  const cancelTransition = () => {
    setSelected(null)
    setForm(getEmptyTransitionForm())
  }

  return {
    allowed,
    selected,
    form,
    amendOpen,
    amendReason,
    readinessOpen,
    isAmending: amendMutation.isPending,
    setAmendReason,
    openAmendModal: () => setAmendOpen(true),
    closeAmendModal,
    toggleReadiness: () => setReadinessOpen((current) => !current),
    setField,
    select,
    submitAmend,
    submitTransition,
    cancelTransition,
  }
}
