import { useState } from 'react'
import { format } from 'date-fns'
import type { AdvancePaymentRow, UpdateAdvancePaymentPayload } from '../api/contracts'
import { toast } from '@/utils/toast'
import { isAdvancePaymentMethod } from '../constants'
import { calcAdvanceAmount, toEditableAmount, toStringOrNull } from '../utils/advancePaymentComponentUtils'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../errorMessages'

interface UseAdvancePaymentDetailFormArgs {
  payment: AdvancePaymentRow
  onSave: (payload: UpdateAdvancePaymentPayload) => Promise<void>
}

/**
 * Amount fields compare numerically: the server echoes '50' back as '50.00',
 * and a string compare would leave the form "dirty" right after a save.
 */
const amountsEqual = (a: string, b: string) => {
  if (a.trim() === '' || b.trim() === '') return a.trim() === b.trim()
  return Number(a) === Number(b)
}

export interface AdvancePaymentDetailForm {
  paidAmount: string
  setPaidAmount: (value: string) => void
  paymentMethod: string
  setPaymentMethod: (value: string) => void
  paymentReference: string
  setPaymentReference: (value: string) => void
  paidAt: string
  setPaidAt: (value: string) => void
  notes: string
  setNotes: (value: string) => void
  turnoverAmount: string
  setTurnoverAmount: (value: string) => void
  overrideAmount: string
  setOverrideAmount: (value: string) => void
  withheldAmount: string
  setWithheldAmount: (value: string) => void

  isDirty: boolean
  liveCalculated: string | null
  liveExpected: string | null

  handleSave: () => Promise<void>
  canFillFullAmount: boolean
  handleFillFullAmount: () => void
  handleResetPaid: () => void
  handleSetToday: () => void
}

export const useAdvancePaymentDetailForm = ({ payment, onSave }: UseAdvancePaymentDetailFormArgs): AdvancePaymentDetailForm => {
  // Seeded once from the loaded payment. The consumer keys this component by
  // payment id, so opening another payment remounts the hook with fresh state —
  // no prop→state sync effect, and refetches (fresh object, same id) never wipe
  // in-progress edits.
  const [paidAmount, setPaidAmount] = useState(() => toEditableAmount(payment.paid_amount))
  const [paymentMethod, setPaymentMethod] = useState<string>(() => payment.payment_method ?? '')
  const [paymentReference, setPaymentReference] = useState(() => payment.payment_reference ?? '')
  const [paidAt, setPaidAt] = useState(() => (payment.paid_at ? payment.paid_at.split('T')[0] : ''))
  const [notes, setNotes] = useState(() => payment.notes ?? '')
  const [turnoverAmount, setTurnoverAmount] = useState(() => toEditableAmount(payment.turnover_amount))
  const [overrideAmount, setOverrideAmount] = useState(() => toEditableAmount(payment.override_amount))
  const [withheldAmount, setWithheldAmount] = useState(() => toEditableAmount(payment.withheld_amount))

  // baseline values derived from the loaded payment
  const baselinePaidAmount = toEditableAmount(payment.paid_amount)
  const baselinePaymentMethod = payment.payment_method ?? ''
  const baselinePaymentReference = payment.payment_reference ?? ''
  const baselinePaidAt = payment.paid_at ? payment.paid_at.split('T')[0] : ''
  const baselineNotes = payment.notes ?? ''
  const baselineTurnover = toEditableAmount(payment.turnover_amount)
  const baselineOverride = toEditableAmount(payment.override_amount)
  const baselineWithheld = toEditableAmount(payment.withheld_amount)

  // normalized form values
  const normalizedPaidAmount = paidAmount.trim()
  const normalizedPaymentMethod = paymentMethod.trim()
  const normalizedPaymentReference = paymentReference.trim()
  const normalizedPaidAt = paidAt.trim()
  const normalizedNotes = notes.trim()

  // live calculation
  const numT = Number(turnoverAmount)
  const numR = Number(payment.advance_rate)
  const liveCalculated =
    turnoverAmount !== '' && payment.advance_rate != null && Number.isFinite(numT) && Number.isFinite(numR)
      ? calcAdvanceAmount(numT, numR)
      : null
  // Withheld is a deduction line off the gross calculated amount, floored at
  // zero — never folded into liveCalculated itself. override_amount still wins.
  const numW = Number(withheldAmount)
  const withheld = withheldAmount !== '' && Number.isFinite(numW) ? numW : 0
  const liveDeducted = liveCalculated != null ? Math.max(0, Number(liveCalculated) - withheld).toFixed(2) : null
  const liveExpected = overrideAmount !== '' ? overrideAmount : liveDeducted

  const isDirty =
    !amountsEqual(baselinePaidAmount, paidAmount) ||
    baselinePaymentMethod !== paymentMethod ||
    baselinePaymentReference !== paymentReference ||
    baselinePaidAt !== paidAt ||
    baselineNotes !== notes ||
    !amountsEqual(baselineTurnover, turnoverAmount) ||
    !amountsEqual(baselineOverride, overrideAmount) ||
    !amountsEqual(baselineWithheld, withheldAmount)

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
    if (!amountsEqual(paidAmount, baselinePaidAmount)) payload.paid_amount = paidAmountPayload
    if (paymentMethod !== baselinePaymentMethod)
      payload.payment_method = normalizedPaymentMethod === '' ? null : normalizedPaymentMethod
    if (paymentReference !== baselinePaymentReference) payload.payment_reference = normalizedPaymentReference || null
    if (paidAt !== baselinePaidAt) payload.paid_at = normalizedPaidAt || null
    if (notes !== baselineNotes) payload.notes = normalizedNotes || null
    if (!amountsEqual(turnoverAmount, baselineTurnover)) payload.turnover_amount = toStringOrNull(turnoverAmount)
    if (!amountsEqual(overrideAmount, baselineOverride)) payload.override_amount = toStringOrNull(overrideAmount)
    if (!amountsEqual(withheldAmount, baselineWithheld)) payload.withheld_amount = toStringOrNull(withheldAmount)

    if (Object.keys(payload).length === 0) return
    await onSave(payload)
  }

  // Only meaningful when something is actually due — filling "0.00" as a paid
  // amount reads as a recorded payment that never happened.
  const canFillFullAmount = liveExpected != null && Number(liveExpected) > 0

  const handleFillFullAmount = () => {
    if (!canFillFullAmount) return
    setPaidAmount(liveExpected)
    if (!paidAt) {
      setPaidAt(format(new Date(), 'yyyy-MM-dd'))
    }
  }

  const handleResetPaid = () => {
    setPaidAmount('0')
  }

  const handleSetToday = () => {
    setPaidAt(format(new Date(), 'yyyy-MM-dd'))
  }

  return {
    paidAmount,
    setPaidAmount,
    paymentMethod,
    setPaymentMethod,
    paymentReference,
    setPaymentReference,
    paidAt,
    setPaidAt,
    notes,
    setNotes,
    turnoverAmount,
    setTurnoverAmount,
    overrideAmount,
    setOverrideAmount,
    withheldAmount,
    setWithheldAmount,
    isDirty,
    liveCalculated,
    liveExpected,
    handleSave,
    canFillFullAmount,
    handleFillFullAmount,
    handleResetPaid,
    handleSetToday,
  }
}
