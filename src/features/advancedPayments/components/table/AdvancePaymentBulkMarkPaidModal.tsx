import { Modal } from '@/components/ui/overlays/Modal'
import { Button } from '@/components/ui/primitives/Button'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { DatePicker } from '@/components/ui/inputs/DatePicker'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { ADVANCE_PAYMENT_METHOD_OPTIONS } from '../../constants'
import type { BulkMarkPaidController } from '../../hooks/useBulkMarkPaid'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

const MESSAGES = ADVANCED_PAYMENTS_MESSAGES.bulkMarkPaid

export const AdvancePaymentBulkMarkPaidModal: React.FC<{ bulk: BulkMarkPaidController }> = ({ bulk }) => (
  <Modal
    open={bulk.modalOpen}
    title={MESSAGES.modalTitle}
    onClose={bulk.closeModal}
    footer={
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={bulk.closeModal} disabled={bulk.isSubmitting}>
          {GLOBAL_UI_MESSAGES.actions.cancel}
        </Button>
        <Button variant="primary" isLoading={bulk.isSubmitting} onClick={bulk.submit}>
          {MESSAGES.confirmButton}
        </Button>
      </div>
    }
  >
    <div className="space-y-4">
      <p className="text-sm text-gray-600">{MESSAGES.modalMessage(bulk.selectedIds.size)}</p>
      <DatePicker label={MESSAGES.paidAtLabel} value={bulk.paidAt} onChange={bulk.setPaidAt} />
      <Select
        label={ADVANCED_PAYMENTS_MESSAGES.editableSections.paymentMethodLabel}
        value={bulk.paymentMethod}
        onChange={(e) => bulk.setPaymentMethod(e.target.value)}
        options={[
          { value: '', label: ADVANCED_PAYMENTS_MESSAGES.editableSections.noMethodOption },
          ...ADVANCE_PAYMENT_METHOD_OPTIONS,
        ]}
      />
      <div className="space-y-1">
        <Input
          label={MESSAGES.referencePrefixLabel}
          placeholder={MESSAGES.referencePrefixPlaceholder}
          maxLength={80}
          value={bulk.referencePrefix}
          onChange={(e) => bulk.setReferencePrefix(e.target.value)}
        />
        <p className="text-xs text-gray-500">{MESSAGES.referencePrefixHint}</p>
      </div>
    </div>
  </Modal>
)

AdvancePaymentBulkMarkPaidModal.displayName = 'AdvancePaymentBulkMarkPaidModal'
