import { Button } from '../../../../components/ui/primitives/Button'
import { Modal } from '../../../../components/ui/overlays/Modal'
import { Textarea } from '../../../../components/ui/inputs/Textarea'
import type { AmendReportModalProps } from '../../types'
import { AMEND_REASON_MIN_LENGTH } from '../../constants/statusTransitionConstants'
import { isValidAmendReason } from '../../utils/statusTransitionHelpers'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'
import { ANNUAL_REPORTS_ERROR_MESSAGES } from '../../errorMessages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

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
      title={ANNUAL_REPORTS_MESSAGES.amendModal.title}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {GLOBAL_UI_MESSAGES.actions.cancel}
          </Button>
          <Button type="button" variant="primary" onClick={onSubmit} isLoading={isPending} disabled={!isReasonValid}>
            {ANNUAL_REPORTS_MESSAGES.amendModal.submit}
          </Button>
        </div>
      }
    >
      <Textarea
        label={ANNUAL_REPORTS_MESSAGES.amendModal.reasonLabel}
        rows={4}
        value={reason}
        onChange={(e) => onReasonChange(e.target.value)}
        placeholder={ANNUAL_REPORTS_MESSAGES.amendModal.reasonPlaceholder(AMEND_REASON_MIN_LENGTH)}
      />
      {showValidation && (
        <p className="mt-1 text-xs text-negative-500">
          {ANNUAL_REPORTS_ERROR_MESSAGES.amend.minLength(AMEND_REASON_MIN_LENGTH)}
        </p>
      )}
    </Modal>
  )
}
