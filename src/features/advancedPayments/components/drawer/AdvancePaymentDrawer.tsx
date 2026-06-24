import { useMemo } from 'react'
import { DefinitionList } from '@/components/ui/layout/DefinitionList'
import { Alert } from '@/components/ui/overlays/Alert'
import { DetailDrawer } from '@/components/ui/overlays/DetailDrawer'
import { DrawerField, DrawerSection } from '@/components/ui/overlays/DrawerPrimitives'
import type { UpdateAdvancePaymentPayload } from '../../api/contracts'
import { formatShekelAmount, formatDate } from '@/utils/utils'
import { getAdvancePaymentMonthLabel } from '../../utils/advancePaymentComponentUtils'
import {
  formatAdvanceRate,
  toAdvancePaymentDrawerModel,
  type AdvancePaymentDrawerRow,
} from '../../utils/advancePaymentDrawerModel'
import { useAdvancePaymentDrawerForm } from '../../hooks/useAdvancePaymentDrawerForm'
import { AdvancePaymentDrawerFooter } from './AdvancePaymentDrawerFooter'
import { AdvancePaymentEditableSections } from './AdvancePaymentEditableSections'
import { AdvancePaymentReadonlySections } from './AdvancePaymentReadonlySections'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

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

  const timingStatusLabel = model.paidLate ? ADVANCED_PAYMENTS_MESSAGES.drawer.paidLateLabel : model.timingStatus === 'overdue' ? ADVANCED_PAYMENTS_MESSAGES.drawer.overdueLabel : null
  const timingStatusClass = model.paidLate ? 'text-warning-600' : 'text-negative-600'

  const advanceRateDisplay = formatAdvanceRate(model.advanceRate)
  const subtitle = [
    model.clientDisplayName,
    model.officeClientNumber != null ? ADVANCED_PAYMENTS_MESSAGES.drawer.clientNumberPrefix(model.officeClientNumber) : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const contextItems = [
    ...(model.idNumber ? [{ label: ADVANCED_PAYMENTS_MESSAGES.drawer.idNumberLabel, value: model.idNumber }] : []),
    ...(advanceRateDisplay ? [{ label: ADVANCED_PAYMENTS_MESSAGES.drawer.advanceRateLabel, value: advanceRateDisplay }] : []),
  ]

  const turnoverLabel =
    model.turnoverAmount != null
      ? ADVANCED_PAYMENTS_MESSAGES.drawer.manualTurnoverSuffix(formatShekelAmount(model.turnoverAmount))
      : model.liveTurnover != null
        ? ADVANCED_PAYMENTS_MESSAGES.drawer.liveTurnoverSuffix(formatShekelAmount(model.liveTurnover))
        : null

  const title = ADVANCED_PAYMENTS_MESSAGES.drawer.title(getAdvancePaymentMonthLabel(model.period, model.periodMonthsCount))

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
            onSave={form.handleSave}
            onDelete={onDelete}
          />
        ) : undefined
      }
    >
      <div className="space-y-5">
        {model.missingTurnover && (
          <Alert variant="warning" size="sm" message={ADVANCED_PAYMENTS_MESSAGES.drawer.missingTurnoverAlert} />
        )}

        {contextItems.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2.5 shadow-elevation-0">
            <DefinitionList items={contextItems} columns={2} className="gap-x-4 gap-y-2" valueClassName="truncate" />
          </div>
        )}

        <DrawerSection title={ADVANCED_PAYMENTS_MESSAGES.drawer.periodSectionTitle}>
          <DrawerField label={ADVANCED_PAYMENTS_MESSAGES.drawer.dueDateLabel} value={formatDate(model.dueDateEffective ?? model.dueDate)} />
          <DrawerField
            label={ADVANCED_PAYMENTS_MESSAGES.drawer.periodTurnoverLabel}
            value={turnoverLabel ?? <span className="text-gray-400 text-xs">{ADVANCED_PAYMENTS_MESSAGES.drawer.vatPendingNote}</span>}
          />
          {timingStatusLabel && (
            <DrawerField
              label={ADVANCED_PAYMENTS_MESSAGES.drawer.timingStatusLabel}
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
