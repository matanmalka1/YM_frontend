import { Modal } from '@/components/ui/overlays/Modal'
import { Button } from '@/components/ui/primitives/Button'
import { ClientPickerField } from '@/components/shared/client/ClientPickerField'
import { CreateAdvancePaymentModal } from './CreateAdvancePaymentModal'
import { useCreateAdvancePayment } from '../hooks/useCreateAdvancePayment'

interface Props {
  open: boolean
  year: number
  onClose: () => void
}

export const CreateAdvancePaymentFlow: React.FC<Props> = ({ open, year, onClose }) => {
  const { picker, clientId, frequency, isPending, reset, onCreate } = useCreateAdvancePayment()

  const handleClose = () => {
    reset()
    onClose()
  }

  if (clientId !== null) {
    return (
      <CreateAdvancePaymentModal
        open={true}
        clientId={clientId}
        year={year}
        defaultPeriodMonthsCount={frequency ?? undefined}
        isCreating={isPending}
        onClose={handleClose}
        onCreate={onCreate}
      />
    )
  }

  return (
    <Modal
      open={open}
      title="הוסף מקדמה — בחר לקוח"
      className="min-h-[240px]"
      onClose={handleClose}
      footer={
        <Button variant="outline" onClick={handleClose}>
          ביטול
        </Button>
      }
    >
      <ClientPickerField
        selectedClient={picker.selectedClient}
        clientQuery={picker.clientQuery}
        onQueryChange={picker.handleClientQueryChange}
        onSelect={picker.handleSelectClient}
        onClear={picker.handleClearClient}
      />
    </Modal>
  )
}
