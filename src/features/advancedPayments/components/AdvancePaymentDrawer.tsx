import { useState, useEffect } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { DetailDrawer, DrawerField, DrawerSection } from '../../../components/ui/overlays/DetailDrawer'
import { Input } from '../../../components/ui/inputs/Input'
import { Select } from '../../../components/ui/inputs/Select'
import { DatePicker } from '../../../components/ui/inputs/DatePicker'
import { Button } from '../../../components/ui/primitives/Button'
import type { AdvancePaymentOverviewRow, AdvancePaymentRow, UpdateAdvancePaymentPayload } from '../api/contracts'
import { ADVANCE_PAYMENT_STATUS_OPTIONS, ADVANCE_PAYMENT_METHOD_OPTIONS } from '../constants'
import { formatShekelAmount } from '@/utils/utils'
import { getAdvancePaymentMonthLabel } from './advancePaymentComponent.utils'
import { formatDate } from '../../../utils/utils'
import { toEditableAmount, toStringOrNull } from './advancePaymentComponent.utils'
import { toast } from '../../../utils/toast'
import { advancePaymentsApi } from '../api'

type AdvancePaymentDrawerRow = AdvancePaymentRow | AdvancePaymentOverviewRow

const getOfficeClientNumber = (row: AdvancePaymentDrawerRow) =>
  'office_client_number' in row ? row.office_client_number : null

const getIdNumber = (row: AdvancePaymentDrawerRow) => ('id_number' in row ? row.id_number : null)

const getAdvanceRate = (row: AdvancePaymentDrawerRow) => ('advance_rate' in row ? row.advance_rate : null)

const getPaidAt = (row: AdvancePaymentDrawerRow) => ('paid_at' in row ? row.paid_at : null)

const getNotes = (row: AdvancePaymentDrawerRow) => ('notes' in row ? row.notes : null)

const getPaidLate = (row: AdvancePaymentDrawerRow) => ('paid_late' in row ? row.paid_late : false)

const formatAdvanceRate = (value: string | null | undefined) => {
  if (value == null || value === '') return null
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return `${value}%`
  return `${numericValue.toLocaleString('he-IL', { maximumFractionDigits: 2 })}%`
}

interface AdvancePaymentDrawerProps {
  row: AdvancePaymentDrawerRow | null
  open: boolean
  isUpdating: boolean
  isDeleting?: boolean
  canEdit: boolean
  onClose: () => void
  onSave: (id: number, payload: UpdateAdvancePaymentPayload) => Promise<void>
  onDelete?: (id: number) => Promise<void>
  clientName?: string | null
  clientIdNumber?: string | null
  officeClientNumber?: number | null
}

export const AdvancePaymentDrawer: React.FC<AdvancePaymentDrawerProps> = ({
  row,
  open,
  isUpdating,
  isDeleting = false,
  canEdit,
  onClose,
  onSave,
  onDelete,
  clientName: clientNameProp,
  clientIdNumber: clientIdNumberProp,
  officeClientNumber: officeClientNumberProp,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [paidAmount, setPaidAmount] = useState('')
  const [status, setStatus] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [paidAt, setPaidAt] = useState('')
  const [notes, setNotes] = useState('')
  const [turnoverAmount, setTurnoverAmount] = useState('')
  const [overrideAmount, setOverrideAmount] = useState('')
  const [prefillSource, setPrefillSource] = useState<null | 'vat_filed' | 'vat_pending' | 'none'>(null)
  const [isPrefilling, setIsPrefilling] = useState(false)

  useEffect(() => {
    if (!row) return
    const nextPaidAt = getPaidAt(row)
    setPaidAmount(toEditableAmount(row.paid_amount))
    setStatus(row.status)
    setPaymentMethod(row.payment_method ?? '')
    setPaidAt(nextPaidAt ? nextPaidAt.split('T')[0] : '')
    setNotes(getNotes(row) ?? '')
    setTurnoverAmount(toEditableAmount(row.turnover_amount ?? null))
    setOverrideAmount(toEditableAmount('override_amount' in row ? (row.override_amount ?? null) : null))
    setPrefillSource(null)
    setConfirmDelete(false)
  }, [row])

  if (!row) return null

  // row field accessors
  const rowPaidAt = getPaidAt(row)
  const rowNotes = getNotes(row)
  const rowTurnoverAmount = 'turnover_amount' in row ? (row.turnover_amount ?? null) : null
  const rowOverrideAmount = 'override_amount' in row ? (row.override_amount ?? null) : null
  const rowAdvanceRate = getAdvanceRate(row)

  // normalized form values
  const normalizedPaidAmount = paidAmount.trim()
  const normalizedPaymentMethod = paymentMethod.trim()
  const normalizedPaidAt = paidAt.trim()
  const normalizedNotes = notes.trim()
  const currentPaidAt = rowPaidAt ? rowPaidAt.split('T')[0] : ''

  // live calculation
  const numT = Number(turnoverAmount)
  const numR = Number(rowAdvanceRate)
  const liveCalculated =
    turnoverAmount !== '' && rowAdvanceRate != null && Number.isFinite(numT) && Number.isFinite(numR)
      ? ((numT * numR) / 100).toFixed(2)
      : null
  const liveExpected = overrideAmount !== '' ? overrideAmount : liveCalculated

  // payment state
  const isPaymentStatus = status === 'paid' || status === 'partial'
  const paidLate = getPaidLate(row)
  const timingStatusLabel = paidLate ? 'שולם באיחור' : row.timing_status === 'overdue' ? 'באיחור' : null
  const timingStatusClass = paidLate ? 'text-warning-600' : 'text-error-600'

  // AdvancePaymentOverviewRow includes client identity fields; AdvancePaymentRow does not — caller passes them as props instead
  const clientDisplayName = clientNameProp ?? row.business_name ?? null
  const officeClientNumber = getOfficeClientNumber(row) ?? officeClientNumberProp ?? null
  const idNumber = getIdNumber(row) ?? clientIdNumberProp ?? null
  const advanceRateDisplay = formatAdvanceRate(rowAdvanceRate)
  const subtitle = [clientDisplayName, officeClientNumber != null ? `מס׳ לקוח ${officeClientNumber}` : null]
    .filter(Boolean)
    .join(' · ')
  const contextItems = [
    ...(idNumber ? [{ label: 'ת.ז / ח.פ', value: idNumber }] : []),
    ...(advanceRateDisplay ? [{ label: 'שיעור מקדמה', value: advanceRateDisplay }] : []),
  ]

  const isDirty =
    toEditableAmount(row.paid_amount) !== paidAmount ||
    row.status !== status ||
    (row.payment_method ?? '') !== paymentMethod ||
    currentPaidAt !== paidAt ||
    (rowNotes ?? '') !== notes ||
    toEditableAmount(rowTurnoverAmount) !== turnoverAmount ||
    toEditableAmount(rowOverrideAmount) !== overrideAmount

  const handlePrefill = async () => {
    setIsPrefilling(true)
    try {
      const result = await advancePaymentsApi.getPrefillTurnover(
        row.client_record_id,
        row.period,
        row.period_months_count,
      )
      setPrefillSource(result.source)
      if (result.source !== 'none' && result.turnover_amount != null) {
        setTurnoverAmount(result.turnover_amount)
      }
    } finally {
      setIsPrefilling(false)
    }
  }

  const handleSave = async () => {
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
    const effectiveExpected = liveExpected != null ? Number(liveExpected) : Number(row.expected_amount ?? 0)
    if (
      status === 'paid' &&
      Number.isFinite(effectiveExpected) &&
      effectiveExpected > 0 &&
      numericPaid < effectiveExpected
    ) {
      toast.error('סכום ששולם נמוך מהסכום הצפוי. יש לבחור סטטוס חלקי')
      return
    }

    if (paidAmount !== toEditableAmount(row.paid_amount)) payload.paid_amount = paidAmountPayload
    if (status !== row.status) payload.status = status as UpdateAdvancePaymentPayload['status']
    if (paymentMethod !== (row.payment_method ?? ''))
      payload.payment_method = (normalizedPaymentMethod || null) as UpdateAdvancePaymentPayload['payment_method']
    if (paidAt !== currentPaidAt) payload.paid_at = normalizedPaidAt || null
    if (notes !== (rowNotes ?? '')) payload.notes = normalizedNotes || null
    if (turnoverAmount !== toEditableAmount(rowTurnoverAmount)) payload.turnover_amount = toStringOrNull(turnoverAmount)
    if (overrideAmount !== toEditableAmount(rowOverrideAmount)) payload.override_amount = toStringOrNull(overrideAmount)

    if (Object.keys(payload).length === 0) return onClose()
    await onSave(row.id, payload)
  }

  const turnoverLabel =
    rowTurnoverAmount != null
      ? `${formatShekelAmount(rowTurnoverAmount)} (מוזן)`
      : row.live_turnover != null
        ? `${formatShekelAmount(row.live_turnover)} (מחזור חי מדוח מע"מ)`
        : null

  const title = `מקדמה - ${getAdvancePaymentMonthLabel(row.period, row.period_months_count)}`

  return (
    <DetailDrawer
      open={open}
      title={title}
      subtitle={subtitle || undefined}
      onClose={onClose}
      isDirty={isDirty}
      footer={
        canEdit ? (
          <div className="flex w-full items-center justify-between gap-2">
            {onDelete &&
              (confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-error-600">למחוק?</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error-600 hover:bg-error-50"
                    isLoading={isDeleting}
                    onClick={async () => {
                      await onDelete(row.id)
                    }}
                    disabled={isUpdating || isDeleting}
                  >
                    כן, מחק
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                    disabled={isUpdating || isDeleting}
                  >
                    ביטול
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-error-600 hover:bg-error-50"
                  onClick={() => setConfirmDelete(true)}
                  disabled={isUpdating || isDeleting}
                  aria-label="מחק מקדמה"
                  title="מחק מקדמה"
                >
                  <Trash2 size={14} />
                </Button>
              ))}
            <div className="flex gap-2 ms-auto">
              <Button variant="outline" onClick={onClose} disabled={isUpdating || isDeleting}>
                ביטול
              </Button>
              <Button variant="primary" isLoading={isUpdating} onClick={handleSave} disabled={isUpdating || isDeleting}>
                שמור
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      <div className="space-y-5">
        {row.missing_turnover && (
          <div className="flex items-start gap-2 rounded-lg bg-warning-50 border border-warning-200 px-3 py-2.5">
            <AlertTriangle className="h-4 w-4 text-warning-600 mt-0.5 shrink-0" />
            <p className="text-sm text-warning-700">חסר מחזור לתקופה — לא ניתן לחשב מקדמה מדויקת</p>
          </div>
        )}

        {contextItems.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              {contextItems.map((item) => (
                <div key={item.label} className="min-w-0">
                  <dt className="text-xs text-gray-500">{item.label}</dt>
                  <dd className="truncate text-sm font-medium text-gray-900">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <DrawerSection title="פרטי תקופה">
          <DrawerField label="תאריך יעד" value={formatDate(row.due_date_effective ?? row.due_date)} />
          <DrawerField
            label="מחזור לתקופה"
            value={turnoverLabel ?? <span className="text-gray-400 text-xs">דוח מע״מ טרם הוגש</span>}
          />
          {timingStatusLabel && (
            <DrawerField
              label="סטטוס עמידה"
              value={<span className={`${timingStatusClass} text-xs font-medium`}>{timingStatusLabel}</span>}
            />
          )}
        </DrawerSection>

        {canEdit ? (
          <>
            <DrawerSection title="חישוב מקדמה">
              <div className="py-4 space-y-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      label="מחזור לתקופה"
                      type="number"
                      min={0}
                      value={turnoverAmount}
                      onChange={(e) => setTurnoverAmount(e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    isLoading={isPrefilling}
                    onClick={handlePrefill}
                    className="mb-0.5 whitespace-nowrap"
                  >
                    מלא ממע״מ
                  </Button>
                </div>
                {prefillSource === 'vat_pending' && (
                  <div className="flex items-center gap-2 rounded-md bg-warning-50 border border-warning-200 px-3 py-2 text-xs text-warning-700">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    מבוסס על דוח מע״מ שטרם הוגש
                  </div>
                )}
                {prefillSource === 'none' && <p className="text-xs text-gray-400">לא נמצא דוח מע״מ לתקופה זו</p>}
                <div>
                  <div className="text-xs text-gray-500 mb-1">סכום מחושב</div>
                  <div className="text-sm font-medium text-gray-800">
                    {liveCalculated != null ? formatShekelAmount(liveCalculated) : '—'}
                  </div>
                </div>
                <Input
                  label="סכום עקיפה (אופציונלי)"
                  type="number"
                  min={0}
                  value={overrideAmount}
                  onChange={(e) => setOverrideAmount(e.target.value)}
                />
                <div>
                  <div className="text-xs text-gray-500 mb-1">סכום סופי</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {liveExpected != null ? formatShekelAmount(liveExpected) : '—'}
                  </div>
                </div>
              </div>
            </DrawerSection>

            <DrawerSection title="עדכון תשלום">
              <div className="py-4 space-y-4">
                <div className="space-y-3">
                  <Input
                    label="סכום שולם"
                    type="number"
                    min={0}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Select
                    label="סטטוס"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={ADVANCE_PAYMENT_STATUS_OPTIONS}
                  />
                  <Select
                    label="שיטת תשלום"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    options={[{ value: '', label: 'ללא' }, ...ADVANCE_PAYMENT_METHOD_OPTIONS]}
                  />
                  <DatePicker label="תאריך ביצוע תשלום" value={paidAt} onChange={setPaidAt} />
                </div>
                <div className="space-y-1">
                  <label htmlFor="advance-payment-notes" className="block text-sm font-medium text-gray-700">
                    הערות
                  </label>
                  <textarea
                    id="advance-payment-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="הערות..."
                  />
                </div>
              </div>
            </DrawerSection>
          </>
        ) : (
          <DrawerSection title="פרטי תשלום">
            <DrawerField label="סכום שולם" value={formatShekelAmount(row.paid_amount)} />
            <DrawerField label="סכום צפוי" value={formatShekelAmount(row.expected_amount)} />
            <DrawerField
              label="מחזור מוזן"
              value={rowTurnoverAmount != null ? formatShekelAmount(rowTurnoverAmount) : null}
            />
            <DrawerField label="אחוז מקדמה" value={advanceRateDisplay} />
            <DrawerField
              label="סכום מחושב"
              value={
                'calculated_amount' in row && row.calculated_amount != null
                  ? formatShekelAmount(row.calculated_amount)
                  : null
              }
            />
            <DrawerField
              label="סכום עקיפה"
              value={rowOverrideAmount != null ? formatShekelAmount(rowOverrideAmount) : null}
            />
            <DrawerField label="שיטת תשלום" value={row.payment_method ?? null} />
            <DrawerField label="תאריך ביצוע" value={rowPaidAt ? formatDate(rowPaidAt) : null} />
            <DrawerField label="הערות" value={rowNotes} />
          </DrawerSection>
        )}
      </div>
    </DetailDrawer>
  )
}

AdvancePaymentDrawer.displayName = 'AdvancePaymentDrawer'
