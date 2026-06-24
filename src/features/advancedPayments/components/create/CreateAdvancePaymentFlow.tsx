import { Modal } from '@/components/ui/overlays/Modal'
import { Button } from '@/components/ui/primitives/Button'
import { ClientPickerField } from '@/components/shared/client/ClientPickerField'
import { CreateAdvancePaymentModal } from './CreateAdvancePaymentModal'
import { useCreateAdvancePayment } from '../../hooks/useCreateAdvancePayment'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface Props {
  open: boolean
  year: number
  onClose: () => void
}

export const CreateAdvancePaymentFlow: React.FC<Props> = ({ open, year, onClose }) => {
  const { picker, clientRecordId, frequency, isPending, reset, onCreate } = useCreateAdvancePayment()

  const handleClose = () => {
    reset()
    onClose()
  }

  if (clientRecordId !== null) {
    return (
      <CreateAdvancePaymentModal
        open={true}
        clientRecordId={clientRecordId}
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
      title={ADVANCED_PAYMENTS_MESSAGES.createFlow.selectClientTitle}
      className="min-h-[240px]"
      onClose={handleClose}
      footer={
        <Button variant="outline" onClick={handleClose}>
          {GLOBAL_UI_MESSAGES.actions.cancel}
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
