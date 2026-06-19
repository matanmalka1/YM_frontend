import { Button } from '../../../../components/ui/primitives/Button'
import { Modal } from '../../../../components/ui/overlays/Modal'
import { Textarea } from '../../../../components/ui/inputs/Textarea'
import type { AmendReportModalProps } from '../../types'
import { AMEND_REASON_MIN_LENGTH } from '../../constants/statusTransitionConstants'
import { isValidAmendReason } from '../../utils/statusTransitionHelpers'

export const AmendReportModal = ({
  open,
  reason,
  isPending,
  onReasonChange,
  onClose,
  onSubmit,
}: AmendReportModalProps) => {
  const trimmedReason = reason.trim()
  const isReasonValid = isValidAmendReason(trimmedReason)
  const showValidation = trimmedReason.length > 0 && !isReasonValid

  return (
    <Modal
      open={open}
      title="תיקון דוח"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            ביטול
          </Button>
          <Button type="button" variant="primary" onClick={onSubmit} isLoading={isPending} disabled={!isReasonValid}>
            שלח
          </Button>
        </div>
      }
    >
      <Textarea
        label="סיבת תיקון *"
        rows={4}
        value={reason}
        onChange={(e) => onReasonChange(e.target.value)}
        placeholder={`תאר את סיבת התיקון (לפחות ${AMEND_REASON_MIN_LENGTH} תווים)...`}
      />
      {showValidation && <p className="mt-1 text-xs text-negative-500">נדרשים לפחות {AMEND_REASON_MIN_LENGTH} תווים</p>}
    </Modal>
  )
}
