import { GLOBAL_UI_MESSAGES } from '@/messages'
import { Alert } from '@/components/ui/overlays/Alert'
import { DrawerSection } from '@/components/ui/overlays/DrawerPrimitives'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { Textarea } from '@/components/ui/inputs/Textarea'
import { DatePicker } from '@/components/ui/inputs/DatePicker'
import { Button } from '@/components/ui/primitives/Button'
import { ADVANCE_PAYMENT_STATUS_OPTIONS, ADVANCE_PAYMENT_METHOD_OPTIONS } from '../../constants'
import { formatShekelAmount } from '@/utils/utils'
import type { AdvancePaymentDrawerForm } from '../../hooks/useAdvancePaymentDrawerForm'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface AdvancePaymentEditableSectionsProps {
  form: AdvancePaymentDrawerForm
}

export const AdvancePaymentEditableSections: React.FC<AdvancePaymentEditableSectionsProps> = ({ form }) => (
  <>
    <DrawerSection title={ADVANCED_PAYMENTS_MESSAGES.editableSections.calculationSectionTitle}>
      <div className="py-4 space-y-3">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label={ADVANCED_PAYMENTS_MESSAGES.editableSections.periodTurnoverLabel}
              type="number"
              min={0}
              value={form.turnoverAmount}
              onChange={(e) => form.setTurnoverAmount(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={form.isPrefilling}
            onClick={form.handlePrefill}
            className="mb-0.5 whitespace-nowrap"
          >
            {ADVANCED_PAYMENTS_MESSAGES.editableSections.prefillButton}
          </Button>
        </div>
        {form.prefillSource === 'vat_pending' && (
          <Alert variant="warning" size="sm" message={ADVANCED_PAYMENTS_MESSAGES.editableSections.vatPendingAlert} />
        )}
        {form.prefillSource === 'none' && (
          <p className="text-xs text-gray-400">{ADVANCED_PAYMENTS_MESSAGES.editableSections.noVatReportNote}</p>
        )}
        <div>
          <div className="text-xs text-gray-500 mb-1">
            {ADVANCED_PAYMENTS_MESSAGES.editableSections.calculatedAmountLabel}
          </div>
          <div className="text-sm font-medium text-gray-800">
            {form.liveCalculated != null ? formatShekelAmount(form.liveCalculated) : '—'}
          </div>
        </div>
        <Input
          label={ADVANCED_PAYMENTS_MESSAGES.editableSections.overrideAmountLabel}
          type="number"
          min={0}
          value={form.overrideAmount}
          onChange={(e) => form.setOverrideAmount(e.target.value)}
        />
        <div>
          <div className="text-xs text-gray-500 mb-1">
            {ADVANCED_PAYMENTS_MESSAGES.editableSections.finalAmountLabel}
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {form.liveExpected != null ? formatShekelAmount(form.liveExpected) : '—'}
          </div>
        </div>
      </div>
    </DrawerSection>

    <DrawerSection title={ADVANCED_PAYMENTS_MESSAGES.editableSections.paymentSectionTitle}>
      <div className="py-4 space-y-4">
        <div className="space-y-3">
          <Input
            label={ADVANCED_PAYMENTS_MESSAGES.editableSections.paidAmountLabel}
            type="number"
            min={0}
            value={form.paidAmount}
            onChange={(e) => form.setPaidAmount(e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <Select
            label={GLOBAL_UI_MESSAGES.common.status}
            value={form.status}
            onChange={(e) => form.setStatus(e.target.value)}
            options={ADVANCE_PAYMENT_STATUS_OPTIONS}
          />
          <Select
            label={ADVANCED_PAYMENTS_MESSAGES.editableSections.paymentMethodLabel}
            value={form.paymentMethod}
            onChange={(e) => form.setPaymentMethod(e.target.value)}
            options={[
              { value: '', label: ADVANCED_PAYMENTS_MESSAGES.editableSections.noMethodOption },
              ...ADVANCE_PAYMENT_METHOD_OPTIONS,
            ]}
          />
          <DatePicker
            label={ADVANCED_PAYMENTS_MESSAGES.editableSections.paidAtLabel}
            value={form.paidAt}
            onChange={form.setPaidAt}
          />
        </div>
        <Textarea
          label={GLOBAL_UI_MESSAGES.common.notes}
          id="advance-payment-notes"
          rows={3}
          value={form.notes}
          onChange={(e) => form.setNotes(e.target.value)}
          placeholder={ADVANCED_PAYMENTS_MESSAGES.editableSections.notesPlaceholder}
        />
      </div>
    </DrawerSection>
  </>
)

AdvancePaymentEditableSections.displayName = 'AdvancePaymentEditableSections'
