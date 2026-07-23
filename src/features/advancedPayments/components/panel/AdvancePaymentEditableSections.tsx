import { Calculator, CheckCircle2, Info, Wallet } from 'lucide-react'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { Alert } from '@/components/ui/overlays/Alert'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { Textarea } from '@/components/ui/inputs/Textarea'
import { DatePicker } from '@/components/ui/inputs/DatePicker'
import { Badge } from '@/components/ui/primitives/Badge'
import { Button } from '@/components/ui/primitives/Button'
import { Card } from '@/components/ui/primitives/Card'
import { IconChip } from '@/components/ui/primitives/IconChip'
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
}) => {
  // What pressing "קבע לפי מע״מ" would do, made visible up front:
  // synced — turnover already snapshotted from VAT, pressing is a no-op;
  // offer  — a VAT figure is waiting, pressing fills it;
  // none   — no VAT report exists, the button cannot do anything.
  const vatSource =
    payment.turnover_source === 'vat_filed' || payment.turnover_source === 'vat_pending' ? payment.turnover_source : null
  const hasNoVatReport = payment.turnover_amount == null && payment.available_turnover == null

  return (
    <>
      <Card
        title={ADVANCED_PAYMENTS_MESSAGES.editableSections.calculationSectionTitle}
        subtitle={ADVANCED_PAYMENTS_MESSAGES.editableSections.calculationSectionSubtitle}
        icon={<IconChip icon={Calculator} tone="info" size="sm" />}
        size="compact"
        variant="outlined"
      >
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
              disabled={hasNoVatReport}
              className="mb-0.5 whitespace-nowrap"
            >
              {ADVANCED_PAYMENTS_MESSAGES.editableSections.refreshTurnoverButton}
            </Button>
          </div>
          {hasNoVatReport && <p className="text-xs text-gray-400">{ADVANCED_PAYMENTS_MESSAGES.detail.noVatReportNote}</p>}
          {vatSource != null && (
            <p className="flex items-center gap-1.5 text-xs text-positive-700">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              {ADVANCED_PAYMENTS_MESSAGES.editableSections.vatSyncedNote}
              {payment.turnover_snapshot_at != null && (
                <span className="text-gray-400">
                  · {ADVANCED_PAYMENTS_MESSAGES.turnoverRefresh.provenance(vatSource, payment.turnover_snapshot_at)}
                </span>
              )}
            </p>
          )}
          {payment.turnover_source === 'manual' && (
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
              {' — '}
              {ADVANCED_PAYMENTS_MESSAGES.editableSections.availableActionHint}
            </p>
          )}
          {/* Live breakdown: turnover × rate = calculated, recomputed as the user types. */}
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-3.5">
            <div className="mb-2 text-xs font-medium text-gray-500">
              {ADVANCED_PAYMENTS_MESSAGES.editableSections.calcBreakdownTitle}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 text-center">
                <div className="text-xs text-gray-500">{ADVANCED_PAYMENTS_MESSAGES.editableSections.reportedTurnoverCell}</div>
                <div className="text-sm font-semibold text-gray-800 tabular-nums">
                  {form.turnoverAmount !== '' ? formatShekelAmount(form.turnoverAmount) : '—'}
                </div>
              </div>
              <div className="rounded-lg border border-info-200 bg-info-50/60 px-3 py-2 text-center">
                <div className="text-xs text-info-700">{ADVANCED_PAYMENTS_MESSAGES.editableSections.calculatedAmountLabel}</div>
                <div className="text-sm font-bold text-info-700 tabular-nums">
                  {form.liveCalculated != null ? formatShekelAmount(form.liveCalculated) : '—'}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <Input
              label={ADVANCED_PAYMENTS_MESSAGES.editableSections.overrideAmountLabel}
              type="number"
              min={0}
              value={form.overrideAmount}
              onChange={(e) => form.setOverrideAmount(e.target.value)}
            />
            <p className="text-xs text-gray-500">{ADVANCED_PAYMENTS_MESSAGES.editableSections.overrideHint}</p>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-gray-900 px-4 py-3">
            <div>
              <div className="text-xs text-gray-400">{ADVANCED_PAYMENTS_MESSAGES.editableSections.finalAmountLabel}</div>
              <div className="text-base font-bold text-white tabular-nums">
                {form.liveExpected != null ? formatShekelAmount(form.liveExpected) : '—'}
              </div>
            </div>
            {form.overrideAmount !== '' && (
              <Badge variant="warning" size="xs">
                {ADVANCED_PAYMENTS_MESSAGES.editableSections.manualOverrideBadge}
              </Badge>
            )}
          </div>
        </div>
      </Card>

      <Card
        title={ADVANCED_PAYMENTS_MESSAGES.editableSections.paymentSectionTitle}
        subtitle={ADVANCED_PAYMENTS_MESSAGES.editableSections.paymentSectionSubtitle}
        icon={<IconChip icon={Wallet} tone="positive" size="sm" />}
        size="compact"
        variant="outlined"
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label={ADVANCED_PAYMENTS_MESSAGES.editableSections.paidAmountLabel}
                  type="number"
                  min={0}
                  value={form.paidAmount}
                  onChange={(e) => form.setPaidAmount(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={form.handleFillFullAmount}
                disabled={!form.canFillFullAmount}
                className="mb-0.5 whitespace-nowrap"
              >
                {ADVANCED_PAYMENTS_MESSAGES.editableSections.fillFullAmountButton}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={form.handleResetPaid}
                className="mb-0.5 whitespace-nowrap"
              >
                {ADVANCED_PAYMENTS_MESSAGES.editableSections.resetPaidButton}
              </Button>
            </div>
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
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <DatePicker
                  label={ADVANCED_PAYMENTS_MESSAGES.editableSections.paidAtLabel}
                  value={form.paidAt}
                  onChange={form.setPaidAt}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={form.handleSetToday}
                className="mb-0.5 whitespace-nowrap"
              >
                {ADVANCED_PAYMENTS_MESSAGES.editableSections.setTodayButton}
              </Button>
            </div>
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
}

AdvancePaymentEditableSections.displayName = 'AdvancePaymentEditableSections'
