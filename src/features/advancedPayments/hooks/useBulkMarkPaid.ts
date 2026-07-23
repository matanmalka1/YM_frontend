import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { toast } from '@/utils/toast'
import { showErrorToast } from '@/utils/utils'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type { AdvancePaymentMethod } from '../api/contracts'
import { isAdvancePaymentMethod } from '../constants'
import { ADVANCED_PAYMENTS_MESSAGES } from '../messages'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../errorMessages'

/** Selection + confirm-modal state for the org-list bulk mark-paid action. */
export const useBulkMarkPaid = () => {
  const queryClient = useQueryClient()
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [paidAt, setPaidAt] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [paymentMethod, setPaymentMethod] = useState('')
  const [referencePrefix, setReferencePrefix] = useState('')

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = (ids: number[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id))
      const next = new Set(prev)
      ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)))
      return next
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const mutation = useMutation({
    mutationFn: () =>
      advancePaymentsApi.bulkMarkPaid({
        payment_ids: [...selectedIds],
        paid_at: paidAt || null,
        payment_method: isAdvancePaymentMethod(paymentMethod) ? (paymentMethod as AdvancePaymentMethod) : null,
        reference_prefix: referencePrefix.trim() || null,
      }),
    onSuccess: (result) => {
      toast.success(ADVANCED_PAYMENTS_MESSAGES.bulkMarkPaid.result(result))
      setModalOpen(false)
      clearSelection()
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
    },
    onError: (error) => showErrorToast(error, ADVANCED_PAYMENTS_ERROR_MESSAGES.bulkMarkPaid.failed),
  })

  return {
    selectedIds,
    toggleSelect,
    toggleAll,
    clearSelection,
    modalOpen,
    openModal: () => setModalOpen(true),
    closeModal: () => setModalOpen(false),
    paidAt,
    setPaidAt,
    paymentMethod,
    setPaymentMethod,
    referencePrefix,
    setReferencePrefix,
    isSubmitting: mutation.isPending,
    submit: () => mutation.mutate(),
  }
}

export type BulkMarkPaidController = ReturnType<typeof useBulkMarkPaid>
