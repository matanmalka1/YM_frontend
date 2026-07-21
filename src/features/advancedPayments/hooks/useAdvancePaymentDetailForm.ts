import { useState } from 'react'
import type { AdvancePaymentRow, UpdateAdvancePaymentPayload } from '../api/contracts'
import { toast } from '@/utils/toast'
import { isAdvancePaymentMethod } from '../constants'
import { calcAdvanceAmount, toEditableAmount, toStringOrNull } from '../utils/advancePaymentComponentUtils'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../errorMessages'

interface UseAdvancePaymentDetailFormArgs {
  payment: AdvancePaymentRow
  onSave: (payload: UpdateAdvancePaymentPayload) => Promise<void>
}

export interface AdvancePaymentDetailForm {
  paidAmount: string
  setPaidAmount: (value: string) => void
  paymentMethod: string
  setPaymentMethod: (value: string) => void
  paidAt: string
  setPaidAt: (value: string) => void
  notes: string
  setNotes: (value: string) => void
  turnoverAmount: string
  setTurnoverAmount: (value: string) => void
  overrideAmount: string
  setOverrideAmount: (value: string) => void

  isDirty: boolean
  liveCalculated: string | null
  liveExpected: string | null

  handleSave: () => Promise<void>
}

export const useAdvancePaymentDetailForm = ({ payment, onSave }: UseAdvancePaymentDetailFormArgs): AdvancePaymentDetailForm => {
  // Seeded once from the loaded payment. The consumer keys this component by
  // payment id, so opening another payment remounts the hook with fresh state —
  // no prop→state sync effect, and refetches (fresh object, same id) never wipe
  // in-progress edits.
  const [paidAmount, setPaidAmount] = useState(() => toEditableAmount(payment.paid_amount))
  const [paymentMethod, setPaymentMethod] = useState<string>(() => payment.payment_method ?? '')
  const [paidAt, setPaidAt] = useState(() => (payment.paid_at ? payment.paid_at.split('T')[0] : ''))
  const [notes, setNotes] = useState(() => payment.notes ?? '')
  const [turnoverAmount, setTurnoverAmount] = useState(() => toEditableAmount(payment.turnover_amount))
  const [overrideAmount, setOverrideAmount] = useState(() => toEditableAmount(payment.override_amount))

  // baseline values derived from the loaded payment
  const baselinePaidAmount = toEditableAmount(payment.paid_amount)
  const baselinePaymentMethod = payment.payment_method ?? ''
  const baselinePaidAt = payment.paid_at ? payment.paid_at.split('T')[0] : ''
  const baselineNotes = payment.notes ?? ''
  const baselineTurnover = toEditableAmount(payment.turnover_amount)
  const baselineOverride = toEditableAmount(payment.override_amount)

  // normalized form values
  const normalizedPaidAmount = paidAmount.trim()
  const normalizedPaymentMethod = paymentMethod.trim()
  const normalizedPaidAt = paidAt.trim()
  const normalizedNotes = notes.trim()

  // live calculation
  const numT = Number(turnoverAmount)
  const numR = Number(payment.advance_rate)
  const liveCalculated =
    turnoverAmount !== '' && payment.advance_rate != null && Number.isFinite(numT) && Number.isFinite(numR)
      ? calcAdvanceAmount(numT, numR)
      : null
  const liveExpected = overrideAmount !== '' ? overrideAmount : liveCalculated

  const isDirty =
    baselinePaidAmount !== paidAmount ||
    baselinePaymentMethod !== paymentMethod ||
    baselinePaidAt !== paidAt ||
    baselineNotes !== notes ||
    baselineTurnover !== turnoverAmount ||
    baselineOverride !== overrideAmount

  const handleSave = async () => {
    const payload: UpdateAdvancePaymentPayload = {}
    const paidAmountPayload = normalizedPaidAmount === '' ? '0' : normalizedPaidAmount
    const numericPaid = Number(paidAmountPayload)

    if (!Number.isFinite(numericPaid) || numericPaid < 0) {
      toast.error(ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.paidAmountInvalid)
      return
    }
    if (normalizedPaymentMethod !== '' && !isAdvancePaymentMethod(normalizedPaymentMethod)) {
      toast.error(ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.paymentMethodInvalid)
      return
    }
    if (paidAmount !== baselinePaidAmount) payload.paid_amount = paidAmountPayload
    if (paymentMethod !== baselinePaymentMethod)
      payload.payment_method = normalizedPaymentMethod === '' ? null : normalizedPaymentMethod
    if (paidAt !== baselinePaidAt) payload.paid_at = normalizedPaidAt || null
    if (notes !== baselineNotes) payload.notes = normalizedNotes || null
    if (turnoverAmount !== baselineTurnover) payload.turnover_amount = toStringOrNull(turnoverAmount)
    if (overrideAmount !== baselineOverride) payload.override_amount = toStringOrNull(overrideAmount)

    if (Object.keys(payload).length === 0) return
    await onSave(payload)
  }

  return {
    paidAmount,
    setPaidAmount,
    paymentMethod,
    setPaymentMethod,
    paidAt,
    setPaidAt,
    notes,
    setNotes,
    turnoverAmount,
    setTurnoverAmount,
    overrideAmount,
    setOverrideAmount,
    isDirty,
    liveCalculated,
    liveExpected,
    handleSave,
  }
}
