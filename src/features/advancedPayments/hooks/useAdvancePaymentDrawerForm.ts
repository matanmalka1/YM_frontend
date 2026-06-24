import { useState } from 'react'
import type { PrefillTurnoverResponse, UpdateAdvancePaymentPayload } from '../api/contracts'
import { advancePaymentsApi } from '../api'
import { toast } from '@/utils/toast'
import { showErrorToast } from '@/utils/utils'
import { isAdvancePaymentMethod, isAdvancePaymentStatus } from '../constants'
import { calcAdvanceAmount, toEditableAmount, toStringOrNull } from '../utils/advancePaymentComponentUtils'
import type { AdvancePaymentDrawerModel } from '../utils/advancePaymentDrawerModel'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../errorMessages'

// `null` = idle (no prefill attempted yet); the rest mirror the API contract.
type PrefillSource = PrefillTurnoverResponse['source'] | null

interface UseAdvancePaymentDrawerFormArgs {
  model: AdvancePaymentDrawerModel | null
  onSave: (id: number, payload: UpdateAdvancePaymentPayload) => Promise<void>
  onClose: () => void
}

export interface AdvancePaymentDrawerForm {
  paidAmount: string
  setPaidAmount: (value: string) => void
  status: string
  setStatus: (value: string) => void
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

  prefillSource: PrefillSource
  isPrefilling: boolean
  handlePrefill: () => Promise<void>
  handleSave: () => Promise<void>
}

export const useAdvancePaymentDrawerForm = ({
  model,
  onSave,
  onClose,
}: UseAdvancePaymentDrawerFormArgs): AdvancePaymentDrawerForm => {
  // Seeded once from the source row. The consumer keys this component by row id
  // (`key={row.id}`), so switching rows remounts the hook with fresh state — no
  // prop→state sync effect, and parent refetches (fresh `model` object, same id)
  // never wipe in-progress edits.
  const [paidAmount, setPaidAmount] = useState(() => (model ? toEditableAmount(model.paidAmount) : ''))
  const [status, setStatus] = useState<string>(() => model?.status ?? '')
  const [paymentMethod, setPaymentMethod] = useState<string>(() => model?.paymentMethod ?? '')
  const [paidAt, setPaidAt] = useState(() => (model?.paidAt ? model.paidAt.split('T')[0] : ''))
  const [notes, setNotes] = useState(() => model?.notes ?? '')
  const [turnoverAmount, setTurnoverAmount] = useState(() => (model ? toEditableAmount(model.turnoverAmount) : ''))
  const [overrideAmount, setOverrideAmount] = useState(() => (model ? toEditableAmount(model.overrideAmount) : ''))
  const [prefillSource, setPrefillSource] = useState<PrefillSource>(null)
  const [isPrefilling, setIsPrefilling] = useState(false)

  // baseline values derived from the source row
  const baselinePaidAmount = model ? toEditableAmount(model.paidAmount) : ''
  const baselinePaymentMethod = model?.paymentMethod ?? ''
  const baselinePaidAt = model?.paidAt ? model.paidAt.split('T')[0] : ''
  const baselineNotes = model?.notes ?? ''
  const baselineTurnover = model ? toEditableAmount(model.turnoverAmount) : ''
  const baselineOverride = model ? toEditableAmount(model.overrideAmount) : ''

  // normalized form values
  const normalizedPaidAmount = paidAmount.trim()
  const normalizedPaymentMethod = paymentMethod.trim()
  const normalizedPaidAt = paidAt.trim()
  const normalizedNotes = notes.trim()

  // live calculation
  const numT = Number(turnoverAmount)
  const numR = Number(model?.advanceRate)
  const liveCalculated =
    turnoverAmount !== '' && model?.advanceRate != null && Number.isFinite(numT) && Number.isFinite(numR)
      ? calcAdvanceAmount(numT, numR)
      : null
  const liveExpected = overrideAmount !== '' ? overrideAmount : liveCalculated

  const isPaymentStatus = status === 'paid' || status === 'partial'

  const isDirty =
    baselinePaidAmount !== paidAmount ||
    model?.status !== status ||
    baselinePaymentMethod !== paymentMethod ||
    baselinePaidAt !== paidAt ||
    baselineNotes !== notes ||
    baselineTurnover !== turnoverAmount ||
    baselineOverride !== overrideAmount

  const handlePrefill = async () => {
    if (!model) return
    setIsPrefilling(true)
    try {
      const result = await advancePaymentsApi.getPrefillTurnover(
        model.clientRecordId,
        model.period,
        model.periodMonthsCount,
      )
      setPrefillSource(result.source)
      if (result.source !== 'none' && result.turnover_amount != null) {
        setTurnoverAmount(result.turnover_amount)
      }
    } catch (err) {
      showErrorToast(err, ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.vatPrefill)
    } finally {
      setIsPrefilling(false)
    }
  }

  const handleSave = async () => {
    if (!model) return
    const payload: UpdateAdvancePaymentPayload = {}
    const paidAmountPayload = normalizedPaidAmount === '' ? '0' : normalizedPaidAmount
    const numericPaid = Number(paidAmountPayload)

    if (!Number.isFinite(numericPaid) || numericPaid < 0) {
      toast.error(ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.paidAmountInvalid)
      return
    }
    if (isPaymentStatus && numericPaid <= 0) {
      toast.error(ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.paidAmountRequired)
      return
    }
    if (isPaymentStatus && normalizedPaidAt === '') {
      toast.error(ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.paidAtRequired)
      return
    }
    if (!isAdvancePaymentStatus(status)) {
      toast.error(ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.paymentStatusInvalid)
      return
    }
    if (normalizedPaymentMethod !== '' && !isAdvancePaymentMethod(normalizedPaymentMethod)) {
      toast.error(ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.paymentMethodInvalid)
      return
    }
    const effectiveExpected = liveExpected != null ? Number(liveExpected) : Number(model.expectedAmount ?? 0)
    if (
      status === 'paid' &&
      Number.isFinite(effectiveExpected) &&
      effectiveExpected > 0 &&
      numericPaid < effectiveExpected
    ) {
      toast.error(ADVANCED_PAYMENTS_ERROR_MESSAGES.advancePayment.partialPaymentRequired)
      return
    }

    if (paidAmount !== baselinePaidAmount) payload.paid_amount = paidAmountPayload
    if (status !== model.status) payload.status = status
    if (paymentMethod !== baselinePaymentMethod)
      payload.payment_method = normalizedPaymentMethod === '' ? null : normalizedPaymentMethod
    if (paidAt !== baselinePaidAt) payload.paid_at = normalizedPaidAt || null
    if (notes !== baselineNotes) payload.notes = normalizedNotes || null
    if (turnoverAmount !== baselineTurnover) payload.turnover_amount = toStringOrNull(turnoverAmount)
    if (overrideAmount !== baselineOverride) payload.override_amount = toStringOrNull(overrideAmount)

    if (Object.keys(payload).length === 0) return onClose()
    await onSave(model.id, payload)
  }

  return {
    paidAmount,
    setPaidAmount,
    status,
    setStatus,
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
    prefillSource,
    isPrefilling,
    handlePrefill,
    handleSave,
  }
}
