import { useState, useEffect } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { DetailDrawer, DrawerField, DrawerSection } from '../../../components/ui/overlays/DetailDrawer'
import { Input } from '../../../components/ui/inputs/Input'
import { Select } from '../../../components/ui/inputs/Select'
import { DatePicker } from '../../../components/ui/inputs/DatePicker'
import { Button } from '../../../components/ui/primitives/Button'
import type { AdvancePaymentOverviewRow, AdvancePaymentRow, UpdateAdvancePaymentPayload } from '../types'
import { ADVANCE_PAYMENT_STATUS_OPTIONS, ADVANCE_PAYMENT_METHOD_OPTIONS } from '../constants'
import { fmtCurrency } from '@/utils/utils'
import { getAdvancePaymentMonthLabel } from './advancePaymentComponent.utils'
import { formatDate } from '../../../utils/utils'
import { toEditableAmount } from './advancePaymentComponent.utils'
import { toast } from '../../../utils/toast'

type AdvancePaymentDrawerRow = AdvancePaymentRow | AdvancePaymentOverviewRow

interface ClientContextItem {
  label: string
  value: string
}

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
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [paidAmount, setPaidAmount] = useState('')
  const [expectedAmount, setExpectedAmount] = useState('')
  const [status, setStatus] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [paidAt, setPaidAt] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!row) return
    const nextPaidAt = getPaidAt(row)
    setPaidAmount(toEditableAmount(row.paid_amount))
    setExpectedAmount(toEditableAmount(row.expected_amount))
    setStatus(row.status)
    setPaymentMethod(row.payment_method ?? '')
    setPaidAt(nextPaidAt ? nextPaidAt.split('T')[0] : '')
    setNotes(getNotes(row) ?? '')
    setConfirmDelete(false)
  }, [row])

  if (!row) return null

  const normalizedPaidAmount = paidAmount.trim()
  const normalizedExpectedAmount = expectedAmount.trim()
  const normalizedPaymentMethod = paymentMethod.trim()
  const normalizedPaidAt = paidAt.trim()
  const normalizedNotes = notes.trim()
  const rowPaidAt = getPaidAt(row)
  const rowNotes = getNotes(row)
  const currentPaidAt = rowPaidAt ? rowPaidAt.split('T')[0] : ''
  const isPaymentStatus = status === 'paid' || status === 'partial'
  const paidLate = getPaidLate(row)
  const timingStatusLabel = paidLate ? 'שולם באיחור' : row.timing_status === 'overdue' ? 'באיחור' : null
  const timingStatusClass = paidLate ? 'text-warning-600' : 'text-error-600'
  const clientDisplayName = row.business_name ?? null
  const officeClientNumber = getOfficeClientNumber(row)
  const idNumber = getIdNumber(row)
  const advanceRate = formatAdvanceRate(getAdvanceRate(row))
  const subtitleParts = [
    clientDisplayName,
    officeClientNumber != null ? `מס׳ לקוח ${officeClientNumber}` : null,
  ].filter(Boolean)
  const clientContextItems: ClientContextItem[] = [
    ...(clientDisplayName ? [{ label: 'לקוח', value: clientDisplayName }] : []),
    ...(officeClientNumber != null ? [{ label: 'מס׳ לקוח', value: String(officeClientNumber) }] : []),
    ...(idNumber ? [{ label: 'ת.ז / ח.פ', value: idNumber }] : []),
    ...(advanceRate ? [{ label: 'שיעור מקדמה', value: advanceRate }] : []),
  ]

  const isDirty =
    toEditableAmount(row.paid_amount) !== paidAmount ||
    toEditableAmount(row.expected_amount) !== expectedAmount ||
    row.status !== status ||
    (row.payment_method ?? '') !== paymentMethod ||
    currentPaidAt !== paidAt ||
    (rowNotes ?? '') !== notes

  const handleSave = async () => {
    const payload: UpdateAdvancePaymentPayload = {}
    const paidAmountPayload = normalizedPaidAmount === '' ? '0' : normalizedPaidAmount
    const expectedAmountPayload = normalizedExpectedAmount === '' ? null : normalizedExpectedAmount
    const numericPaid = Number(paidAmountPayload)
    const numericExpected = expectedAmountPayload === null ? null : Number(expectedAmountPayload)

    if (!Number.isFinite(numericPaid) || numericPaid < 0) {
      toast.error('סכום ששולם חייב להיות מספר תקין שאינו שלילי')
      return
    }
    if (numericExpected !== null && (!Number.isFinite(numericExpected) || numericExpected < 0)) {
      toast.error('סכום צפוי חייב להיות מספר תקין שאינו שלילי')
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
    if (status === 'paid' && numericExpected !== null && numericPaid < numericExpected) {
      toast.error('סכום ששולם נמוך מהסכום הצפוי. יש לבחור סטטוס חלקי')
      return
    }

    if (paidAmount !== toEditableAmount(row.paid_amount)) payload.paid_amount = paidAmountPayload
    if (expectedAmount !== toEditableAmount(row.expected_amount)) payload.expected_amount = expectedAmountPayload
    if (status !== row.status) payload.status = status as UpdateAdvancePaymentPayload['status']
    if (paymentMethod !== (row.payment_method ?? ''))
      payload.payment_method = (normalizedPaymentMethod || null) as UpdateAdvancePaymentPayload['payment_method']
    if (paidAt !== currentPaidAt) payload.paid_at = normalizedPaidAt || null
    if (notes !== (rowNotes ?? '')) payload.notes = normalizedNotes || null

    if (Object.keys(payload).length === 0) return onClose()
    await onSave(row.id, payload)
  }

  const turnoverLabel =
    row.reported_turnover != null
      ? `${fmtCurrency(row.reported_turnover)} (מאושר)`
      : row.live_turnover != null
        ? `${fmtCurrency(row.live_turnover)} (מחזור חי מדוח מע"מ)`
        : null

  const title = `מקדמה - ${getAdvancePaymentMonthLabel(row.period, row.period_months_count)}`

  return (
    <DetailDrawer
      open={open}
      title={title}
      subtitle={subtitleParts.length > 0 ? subtitleParts.join(' · ') : undefined}
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

        {clientContextItems.length > 0 && (
          <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              {clientContextItems.map((item) => (
                <div key={item.label} className="min-w-0">
                  <dt className="text-xs text-gray-500">{item.label}</dt>
                  <dd className="truncate text-sm font-medium text-gray-900">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <DrawerSection title="פרטי תקופה">
          <DrawerField label="תאריך יעד" value={formatDate(row.due_date)} />
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
          <DrawerSection title="עדכון תשלום">
            <div className="py-4 space-y-4">
              <div className="space-y-3">
                <Input
                  label="סכום צפוי"
                  type="number"
                  min={0}
                  value={expectedAmount}
                  onChange={(e) => setExpectedAmount(e.target.value)}
                />
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
        ) : (
          <DrawerSection title="פרטי תשלום">
            <DrawerField label="סכום שולם" value={fmtCurrency(row.paid_amount)} />
            <DrawerField label="סכום צפוי" value={fmtCurrency(row.expected_amount)} />
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
