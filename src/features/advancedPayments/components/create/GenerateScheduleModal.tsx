import { Modal } from '@/components/ui/overlays/Modal'
import { Button } from '@/components/ui/primitives/Button'
import { ClientPickerField } from '@/components/shared/client/ClientPickerField'
import { useGenerateSchedule } from '../../hooks/useGenerateSchedule'
import { ADVANCE_PAYMENT_FREQUENCY_PREFIX, ADVANCE_PAYMENT_FREQUENCY_UNSET_TEXT } from '../../constants'
import { getMonthsCoveredLabel } from '@/constants/periodOptions.constants'

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
      title="צור לוח מקדמות שנתי"
      onClose={handleClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            ביטול
          </Button>
          <Button
            variant="primary"
            isLoading={isPending}
            disabled={
              picker.selectedClient === null || isProfileLoading || isProfileError || frequency == null || isPending
            }
            onClick={handleConfirm}
          >
            צור לוח
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <ClientPickerField
          selectedClient={picker.selectedClient}
          clientQuery={picker.clientQuery}
          onQueryChange={picker.handleClientQueryChange}
          onSelect={picker.handleSelectClient}
          onClear={picker.handleClearClient}
        />
        {picker.selectedClient !== null && (
          <p className="text-sm text-gray-500">
            {isProfileLoading
              ? 'טוען פרופיל לקוח...'
              : isProfileError
                ? 'שגיאה בטעינת פרופיל הלקוח'
                : frequency != null
                  ? `${ADVANCE_PAYMENT_FREQUENCY_PREFIX} ${getMonthsCoveredLabel(frequency)}`
                  : ADVANCE_PAYMENT_FREQUENCY_UNSET_TEXT}
          </p>
        )}
        <p className="text-sm text-gray-500">ייווצרו רק מקדמות שתאריך היעד שלהן מהיום והלאה</p>
      </div>
    </Modal>
  )
}
