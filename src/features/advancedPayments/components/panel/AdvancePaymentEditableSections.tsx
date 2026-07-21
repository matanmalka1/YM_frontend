import { Info } from 'lucide-react'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { Alert } from '@/components/ui/overlays/Alert'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { Textarea } from '@/components/ui/inputs/Textarea'
import { DatePicker } from '@/components/ui/inputs/DatePicker'
import { Button } from '@/components/ui/primitives/Button'
import { Card } from '@/components/ui/primitives/Card'
import { ADVANCE_PAYMENT_METHOD_OPTIONS } from '../../constants'
import { formatShekelAmount } from '@/utils/utils'
import type { AdvancePaymentRow } from '../../api/contracts'
import type { AdvancePaymentDetailForm } from '../../hooks/useAdvancePaymentDetailForm'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface AdvancePaymentEditableSectionsProps {
  form: AdvancePaymentDetailForm
  payment: AdvancePaymentRow
  isRefreshingTurnover: boolean
  onRefreshTurnover: () => Promise<void>
}

export const AdvancePaymentEditableSections: React.FC<AdvancePaymentEditableSectionsProps> = ({
  form,
  payment,
  isRefreshingTurnover,
  onRefreshTurnover,
}) => (
  <>
    <Card title={ADVANCED_PAYMENTS_MESSAGES.editableSections.calculationSectionTitle} size="compact" variant="outlined">
      <div className="space-y-3">
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
            isLoading={isRefreshingTurnover}
            onClick={onRefreshTurnover}
            className="mb-0.5 whitespace-nowrap"
          >
            {ADVANCED_PAYMENTS_MESSAGES.editableSections.refreshTurnoverButton}
          </Button>
        </div>
        {payment.turnover_source != null && (
          <p className="text-xs text-gray-500">
            {ADVANCED_PAYMENTS_MESSAGES.turnoverRefresh.provenance(payment.turnover_source, payment.turnover_snapshot_at)}
          </p>
        )}
        {payment.turnover_source === 'vat_pending' && (
          <Alert variant="warning" size="sm" message={ADVANCED_PAYMENTS_MESSAGES.editableSections.vatPendingAlert} />
        )}
        {/* Sits outside the field: an offer to snapshot, not the period's turnover. */}
        {payment.turnover_amount == null && payment.available_turnover != null && (
          <p className="flex items-center gap-1.5 rounded-lg border border-info-200 bg-info-50 px-2.5 py-1.5 text-xs text-info-700">
            <Info className="h-3.5 w-3.5 shrink-0" />
            {ADVANCED_PAYMENTS_MESSAGES.turnoverRefresh.available(
              payment.available_turnover.source,
              formatShekelAmount(payment.available_turnover.amount),
            )}
          </p>
        )}
        <div>
          <div className="text-xs text-gray-500 mb-1">{ADVANCED_PAYMENTS_MESSAGES.editableSections.calculatedAmountLabel}</div>
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
          <div className="text-xs text-gray-500 mb-1">{ADVANCED_PAYMENTS_MESSAGES.editableSections.finalAmountLabel}</div>
          <div className="text-sm font-semibold text-gray-900">
            {form.liveExpected != null ? formatShekelAmount(form.liveExpected) : '—'}
          </div>
        </div>
      </div>
    </Card>

    <Card title={ADVANCED_PAYMENTS_MESSAGES.editableSections.paymentSectionTitle} size="compact" variant="outlined">
      <div className="space-y-4">
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
    </Card>
  </>
)

AdvancePaymentEditableSections.displayName = 'AdvancePaymentEditableSections'
