import { Button } from '@/components/ui/primitives/Button'
import { ModalFormActions } from '../../../../components/ui/overlays/ModalFormActions'
import { CLIENTS_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface Props {
  isLastStep: boolean
  isLoading: boolean
  nextDisabled?: boolean
  onClose: () => void
  onPrevious: () => void
  onSubmit: () => void
  onNext: () => void
  stepIndex: number
}

export const CreateClientModalFooter: React.FC<Props> = ({
  isLastStep,
  isLoading,
  nextDisabled = false,
  onClose,
  onPrevious,
  onSubmit,
  onNext,
  stepIndex,
}) => {
  if (isLastStep) {
    return (
      <ModalFormActions
        cancelLabel={CLIENTS_MESSAGES.createModal.cancelLabel}
        cancelVariant="ghost"
        onCancel={onPrevious}
        onSubmit={onSubmit}
        isLoading={isLoading}
        submitLabel={CLIENTS_MESSAGES.createModal.submitLabel}
      />
    )
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
        {GLOBAL_UI_MESSAGES.actions.cancel}
      </Button>
      {stepIndex > 0 && (
        <Button type="button" variant="ghost" onClick={onPrevious} disabled={isLoading}>
          {CLIENTS_MESSAGES.createModal.back}
        </Button>
      )}
      <Button type="button" onClick={onNext} disabled={isLoading || nextDisabled}>
        {CLIENTS_MESSAGES.createModal.next}
      </Button>
    </div>
  )
}
