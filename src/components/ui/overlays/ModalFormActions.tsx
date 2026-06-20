import type { ReactNode } from 'react'
import { Button } from '../primitives/Button'
import { useOverlayDismiss } from './useOverlayDismiss'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

interface ModalFormActionsProps {
  cancelDisabled?: boolean
  cancelLabel?: ReactNode
  cancelVariant?: ButtonVariant
  isLoading?: boolean
  /** Optional. When omitted, falls back to the overlay's guarded close handler. */
  onCancel?: () => void
  onSubmit?: () => void
  submitDisabled?: boolean
  submitForm?: string
  submitLabel: ReactNode
  submitLoading?: boolean
  submitType?: 'button' | 'submit'
  submitVariant?: ButtonVariant
}

export const ModalFormActions: React.FC<ModalFormActionsProps> = ({
  cancelDisabled = false,
  cancelLabel = 'ביטול',
  cancelVariant = 'outline',
  isLoading = false,
  onCancel,
  onSubmit,
  submitDisabled = false,
  submitForm,
  submitLabel,
  submitLoading = false,
  submitType = 'button',
  submitVariant = 'primary',
}) => {
  const dismiss = useOverlayDismiss()
  const handleCancel = onCancel ?? dismiss
  const submitProps = submitType === 'submit' ? { form: submitForm } : { onClick: onSubmit }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button type="button" variant={cancelVariant} onClick={handleCancel} disabled={cancelDisabled || isLoading}>
        {cancelLabel}
      </Button>
      <Button
        type={submitType}
        variant={submitVariant}
        isLoading={submitLoading || isLoading}
        disabled={submitDisabled || isLoading}
        {...submitProps}
      >
        {submitLabel}
      </Button>
    </div>
  )
}
