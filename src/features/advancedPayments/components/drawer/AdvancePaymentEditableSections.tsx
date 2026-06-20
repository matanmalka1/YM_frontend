import { AlertTriangle } from 'lucide-react'
import { DrawerSection } from '@/components/ui/overlays/DrawerPrimitives'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { DatePicker } from '@/components/ui/inputs/DatePicker'
import { Button } from '@/components/ui/primitives/Button'
import { ADVANCE_PAYMENT_STATUS_OPTIONS, ADVANCE_PAYMENT_METHOD_OPTIONS } from '../../constants'
import { formatShekelAmount } from '@/utils/utils'
import type { AdvancePaymentDrawerForm } from '../../hooks/useAdvancePaymentDrawerForm'

interface AdvancePaymentEditableSectionsProps {
  form: AdvancePaymentDrawerForm
}

export const AdvancePaymentEditableSections: React.FC<AdvancePaymentEditableSectionsProps> = ({ form }) => (
  <>
    <DrawerSection title="חישוב מקדמה">
      <div className="py-4 space-y-3">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label="מחזור לתקופה"
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
            מלא ממע״מ
          </Button>
        </div>
        {form.prefillSource === 'vat_pending' && (
          <div className="flex items-center gap-2 rounded-md bg-warning-50 border border-warning-200 px-3 py-2 text-xs text-warning-700">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            מבוסס על דוח מע״מ שטרם הוגש
          </div>
        )}
        {form.prefillSource === 'none' && <p className="text-xs text-gray-400">לא נמצא דוח מע״מ לתקופה זו</p>}
        <div>
          <div className="text-xs text-gray-500 mb-1">סכום מחושב</div>
          <div className="text-sm font-medium text-gray-800">
            {form.liveCalculated != null ? formatShekelAmount(form.liveCalculated) : '—'}
          </div>
        </div>
        <Input
          label="סכום עקיפה (אופציונלי)"
          type="number"
          min={0}
          value={form.overrideAmount}
          onChange={(e) => form.setOverrideAmount(e.target.value)}
        />
        <div>
          <div className="text-xs text-gray-500 mb-1">סכום סופי</div>
          <div className="text-sm font-semibold text-gray-900">
            {form.liveExpected != null ? formatShekelAmount(form.liveExpected) : '—'}
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
            value={form.paidAmount}
            onChange={(e) => form.setPaidAmount(e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <Select
            label="סטטוס"
            value={form.status}
            onChange={(e) => form.setStatus(e.target.value)}
            options={ADVANCE_PAYMENT_STATUS_OPTIONS}
          />
          <Select
            label="שיטת תשלום"
            value={form.paymentMethod}
            onChange={(e) => form.setPaymentMethod(e.target.value)}
            options={[{ value: '', label: 'ללא' }, ...ADVANCE_PAYMENT_METHOD_OPTIONS]}
          />
          <DatePicker label="תאריך ביצוע תשלום" value={form.paidAt} onChange={form.setPaidAt} />
        </div>
        <div className="space-y-1">
          <label htmlFor="advance-payment-notes" className="block text-sm font-medium text-gray-700">
            הערות
          </label>
          <textarea
            id="advance-payment-notes"
            rows={3}
            value={form.notes}
            onChange={(e) => form.setNotes(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="הערות..."
          />
        </div>
      </div>
    </DrawerSection>
  </>
)

AdvancePaymentEditableSections.displayName = 'AdvancePaymentEditableSections'
