import { Modal } from '@/components/ui/overlays/Modal'
import { Button } from '@/components/ui/primitives/Button'
import { ClientSearchInput } from '@/features/clients/public'
import { useGenerateSchedule } from '../../hooks/useGenerateSchedule'
import { ADVANCE_PAYMENT_FREQUENCY_PREFIX, ADVANCE_PAYMENT_FREQUENCY_UNSET_TEXT } from '../../constants'
import { getMonthsCoveredLabel } from '@/constants/periodOptions.constants'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../../errorMessages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface Props {
  open: boolean
  year: number
  onClose: () => void
}

export const GenerateScheduleModal: React.FC<Props> = ({ open, year, onClose }) => {
  const { picker, isProfileLoading, isProfileError, frequency, isPending, handleGenerate } = useGenerateSchedule(year)

  const handleClose = () => {
    picker.resetClientPicker()
    onClose()
  }

  const handleConfirm = () => {
    handleGenerate()
    if (!isPending) handleClose()
  }

  return (
    <Modal
      open={open}
      title={ADVANCED_PAYMENTS_MESSAGES.generateScheduleModal.title}
      onClose={handleClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            {GLOBAL_UI_MESSAGES.actions.cancel}
          </Button>
          <Button
            variant="primary"
            isLoading={isPending}
            disabled={picker.selectedClient === null || isProfileLoading || isProfileError || frequency == null || isPending}
            onClick={handleConfirm}
          >
            {ADVANCED_PAYMENTS_MESSAGES.generateScheduleModal.createButton}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <ClientSearchInput
          selectedClient={picker.selectedClient}
          value={picker.clientQuery}
          onChange={picker.handleClientQueryChange}
          onSelect={picker.handleSelectClient}
          onClear={picker.handleClearClient}
        />
        {picker.selectedClient !== null && (
          <p className="text-sm text-gray-500">
            {isProfileLoading
              ? ADVANCED_PAYMENTS_MESSAGES.generateScheduleModal.loadingProfile
              : isProfileError
                ? ADVANCED_PAYMENTS_ERROR_MESSAGES.generateSchedule.profileLoad
                : frequency != null
                  ? `${ADVANCE_PAYMENT_FREQUENCY_PREFIX} ${getMonthsCoveredLabel(frequency)}`
                  : ADVANCE_PAYMENT_FREQUENCY_UNSET_TEXT}
          </p>
        )}
        <p className="text-sm text-gray-500">{ADVANCED_PAYMENTS_MESSAGES.generateScheduleModal.scheduleNote}</p>
      </div>
    </Modal>
  )
}
