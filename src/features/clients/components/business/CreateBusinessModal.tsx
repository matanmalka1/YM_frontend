import { useController, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../../../../components/ui/overlays/Modal'
import { DatePicker } from '../../../../components/ui/inputs/DatePicker'
import { Input } from '../../../../components/ui/inputs/Input'
import { ModalFormActions } from '../../../../components/ui/overlays/ModalFormActions'
import type { CreateBusinessPayload, ISODateString } from '../../api'
import { createBusinessSchema, type CreateBusinessFormValues } from '../../schemas'
import { CLIENTS_MESSAGES } from '../../messages'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateBusinessPayload) => Promise<void>
  isLoading?: boolean
}

export const CreateBusinessModal: React.FC<Props> = ({ open, onClose, onSubmit, isLoading = false }) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateBusinessFormValues>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: {
      business_name: '',
      opened_at: null,
    },
  })
  const { field: openedAtField } = useController({ name: 'opened_at', control })

  const handleClose = () => {
    if (!isLoading) {
      reset()
      onClose()
    }
  }

  const onFormSubmit = handleSubmit(async (data) => {
    const payload: CreateBusinessPayload = {
      business_name: data.business_name,
      opened_at: data.opened_at ? (data.opened_at as ISODateString) : null,
    }
    await onSubmit(payload)
    reset()
  })

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={CLIENTS_MESSAGES.createBusiness.modalTitle}
      footer={
        <ModalFormActions
          onCancel={handleClose}
          onSubmit={onFormSubmit}
          isLoading={isLoading}
          submitLabel={CLIENTS_MESSAGES.createBusiness.submitLabel}
        />
      }
    >
      <form onSubmit={onFormSubmit} className="space-y-4">
        <Input
          label={CLIENTS_MESSAGES.createBusiness.nameLabel}
          placeholder={CLIENTS_MESSAGES.createBusiness.namePlaceholder}
          error={errors.business_name?.message}
          disabled={isLoading}
          {...register('business_name')}
        />
        <DatePicker
          label={CLIENTS_MESSAGES.createBusiness.openedAtLabel}
          error={errors.opened_at?.message}
          disabled={isLoading}
          value={openedAtField.value ?? ''}
          onChange={openedAtField.onChange}
          onBlur={openedAtField.onBlur}
          name={openedAtField.name}
        />
        <p className="text-xs text-gray-500">{CLIENTS_MESSAGES.createBusiness.requiredFieldsNote}</p>
      </form>
    </Modal>
  )
}
