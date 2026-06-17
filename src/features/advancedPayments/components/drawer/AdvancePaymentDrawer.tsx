import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { DetailDrawer, DrawerField, DrawerSection } from '../../../../components/ui/overlays/DetailDrawer'
import type { UpdateAdvancePaymentPayload } from '../../api/contracts'
import { formatShekelAmount } from '@/utils/utils'
import { getAdvancePaymentMonthLabel } from '../advancePaymentComponent.utils'
import { formatDate } from '../../../../utils/utils'
import {
  formatAdvanceRate,
  toAdvancePaymentDrawerModel,
  type AdvancePaymentDrawerRow,
} from './advancePaymentDrawer.model'
import { useAdvancePaymentDrawerForm } from './useAdvancePaymentDrawerForm'
import { AdvancePaymentDrawerFooter } from './AdvancePaymentDrawerFooter'
import { AdvancePaymentEditableSections } from './AdvancePaymentEditableSections'
import { AdvancePaymentReadonlySections } from './AdvancePaymentReadonlySections'

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
  clientName,
  clientIdNumber,
  officeClientNumber,
}) => {
  const model = useMemo(
    () => (row ? toAdvancePaymentDrawerModel(row, { clientName, clientIdNumber, officeClientNumber }) : null),
    [row, clientName, clientIdNumber, officeClientNumber],
  )

  const form = useAdvancePaymentDrawerForm({ model, onSave, onClose })

  if (!model) return null

  const timingStatusLabel = model.paidLate ? 'שולם באיחור' : model.timingStatus === 'overdue' ? 'באיחור' : null
  const timingStatusClass = model.paidLate ? 'text-warning-600' : 'text-error-600'

  const advanceRateDisplay = formatAdvanceRate(model.advanceRate)
  const subtitle = [
    model.clientDisplayName,
    model.officeClientNumber != null ? `מס׳ לקוח ${model.officeClientNumber}` : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const contextItems = [
    ...(model.idNumber ? [{ label: 'ת.ז / ח.פ', value: model.idNumber }] : []),
    ...(advanceRateDisplay ? [{ label: 'שיעור מקדמה', value: advanceRateDisplay }] : []),
  ]

  const turnoverLabel =
    model.turnoverAmount != null
      ? `${formatShekelAmount(model.turnoverAmount)} (מוזן)`
      : model.liveTurnover != null
        ? `${formatShekelAmount(model.liveTurnover)} (מחזור חי מדוח מע"מ)`
        : null

  const title = `מקדמה - ${getAdvancePaymentMonthLabel(model.period, model.periodMonthsCount)}`

  return (
    <DetailDrawer
      open={open}
      title={title}
      subtitle={subtitle || undefined}
      onClose={onClose}
      isDirty={form.isDirty}
      footer={
        canEdit ? (
          <AdvancePaymentDrawerFooter
            key={model.id}
            rowId={model.id}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            onClose={onClose}
            onSave={form.handleSave}
            onDelete={onDelete}
          />
        ) : undefined
      }
    >
      <div className="space-y-5">
        {model.missingTurnover && (
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
          <DrawerField label="תאריך יעד" value={formatDate(model.dueDateEffective ?? model.dueDate)} />
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

        {canEdit ? <AdvancePaymentEditableSections form={form} /> : <AdvancePaymentReadonlySections model={model} />}
      </div>
    </DetailDrawer>
  )
}

AdvancePaymentDrawer.displayName = 'AdvancePaymentDrawer'
