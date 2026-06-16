import { useEffect, useState } from 'react'
import type { PrefillTurnoverResponse, UpdateAdvancePaymentPayload } from '../../api/contracts'
import { advancePaymentsApi } from '../../api'
import { toast } from '../../../../utils/toast'
import { showErrorToast } from '../../../../utils/utils'
import { calcAdvanceAmount, toEditableAmount, toStringOrNull } from '../advancePaymentComponent.utils'
import type { AdvancePaymentDrawerModel } from './advancePaymentDrawer.model'

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
  const [paidAmount, setPaidAmount] = useState('')
  const [status, setStatus] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [paidAt, setPaidAt] = useState('')
  const [notes, setNotes] = useState('')
  const [turnoverAmount, setTurnoverAmount] = useState('')
  const [overrideAmount, setOverrideAmount] = useState('')
  const [prefillSource, setPrefillSource] = useState<PrefillSource>(null)
  const [isPrefilling, setIsPrefilling] = useState(false)

  useEffect(() => {
    if (!model) return
    setPaidAmount(toEditableAmount(model.paidAmount))
    setStatus(model.status)
    setPaymentMethod(model.paymentMethod ?? '')
    setPaidAt(model.paidAt ? model.paidAt.split('T')[0] : '')
    setNotes(model.notes ?? '')
    setTurnoverAmount(toEditableAmount(model.turnoverAmount))
    setOverrideAmount(toEditableAmount(model.overrideAmount))
    setPrefillSource(null)
    // Reset only when the underlying row changes (by id), not on every parent
    // refetch — `model` is a fresh object each render and would otherwise wipe
    // in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model?.id])

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
      showErrorToast(err, 'טעינת מחזור ממע״מ נכשלה')
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
      toast.error('סכום ששולם חייב להיות מספר תקין שאינו שלילי')
      return
    }
    if (isPaymentStatus && numericPaid <= 0) {
      toast.error('סטטוס שולם או חלקי מחייב סכום ששולם גדול מאפס')
      return
    }
    if (isPaymentStatus && normalizedPaidAt === '') {
      toast.error('תאריך ביצוע תשלום נדרש כאשר הסטטוס שולם או חלקי')
      return
    }
    const effectiveExpected = liveExpected != null ? Number(liveExpected) : Number(model.expectedAmount ?? 0)
    if (
      status === 'paid' &&
      Number.isFinite(effectiveExpected) &&
      effectiveExpected > 0 &&
      numericPaid < effectiveExpected
    ) {
      toast.error('סכום ששולם נמוך מהסכום הצפוי. יש לבחור סטטוס חלקי')
      return
    }

    if (paidAmount !== baselinePaidAmount) payload.paid_amount = paidAmountPayload
    if (status !== model.status) payload.status = status as UpdateAdvancePaymentPayload['status']
    if (paymentMethod !== baselinePaymentMethod)
      payload.payment_method = (normalizedPaymentMethod || null) as UpdateAdvancePaymentPayload['payment_method']
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
