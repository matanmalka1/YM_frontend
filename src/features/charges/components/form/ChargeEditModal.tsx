import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { Textarea } from '@/components/ui/inputs'
import { Modal, ModalFormActions } from '@/components/ui/overlays'
import { useBusinessesForClient } from '@/features/clients/public'
import type { ChargeResponse } from '../../api'
import { CHARGE_EDIT_FORM_ID } from '../../constants'
import { chargeEditSchema, toChargeEditDefaultValues, toUpdateChargePayload, type ChargeEditFormValues } from '../../schemas'
import { getChargeBusinessLabel } from '../../utils/chargeUtils'
import { CHARGES_MESSAGES } from '../../messages'
import { ChargeCoreFields } from './ChargeCoreFields'

interface ChargeEditModalProps {
  open: boolean
  charge: ChargeResponse
  updateError: string | null
  updateLoading: boolean
  onClose: () => void
  onSubmit: (payload: ReturnType<typeof toUpdateChargePayload>) => Promise<boolean>
}

export const ChargeEditModal: React.FC<ChargeEditModalProps> = ({
  open,
  charge,
  updateError,
  updateLoading,
  onClose,
  onSubmit,
}) => {
  const form = useForm<ChargeEditFormValues>({
    defaultValues: toChargeEditDefaultValues(charge),
    resolver: zodResolver(chargeEditSchema),
  })
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
  } = form

  // Re-seed when a different charge is opened, or after a refetch changes the row.
  useEffect(() => {
    if (open) reset(toChargeEditDefaultValues(charge))
  }, [charge, open, reset])

  const { businesses } = useBusinessesForClient({ clientId: charge.client_record_id, enabled: open })

  const businessOptions = useMemo(
    () => [
      { value: '', label: CHARGES_MESSAGES.create.noBusiness },
      ...businesses.map((b) => ({ value: String(b.id), label: getChargeBusinessLabel(b) })),
    ],
    [businesses],
  )

  const handleClose = () => {
    reset(toChargeEditDefaultValues(charge))
    onClose()
  }

  const submitForm = handleSubmit(async (values) => {
    const updated = await onSubmit(toUpdateChargePayload(values))
    if (updated) onClose()
  })

  return (
    <Modal
      open={open}
      title={CHARGES_MESSAGES.edit.title(charge.id)}
      isDirty={isDirty}
      onClose={handleClose}
      footer={
        <ModalFormActions
          cancelVariant="secondary"
          isLoading={updateLoading}
          submitType="submit"
          submitForm={CHARGE_EDIT_FORM_ID}
          submitLabel={CHARGES_MESSAGES.edit.submit}
        />
      }
    >
      <form id={CHARGE_EDIT_FORM_ID} onSubmit={submitForm} className="space-y-4">
        <FormProvider {...form}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ChargeCoreFields businessOptions={businessOptions} showBusinessSelect={businesses.length > 1} />
            <div className="col-span-2">
              <Textarea
                label={CHARGES_MESSAGES.edit.description}
                rows={3}
                className="resize-none"
                placeholder={CHARGES_MESSAGES.edit.descriptionPlaceholder}
                error={errors.description?.message}
                {...register('description')}
              />
            </div>
          </div>
        </FormProvider>

        {updateError && <p className="text-sm text-negative-600">{updateError}</p>}
      </form>
    </Modal>
  )
}

ChargeEditModal.displayName = 'ChargeEditModal'
