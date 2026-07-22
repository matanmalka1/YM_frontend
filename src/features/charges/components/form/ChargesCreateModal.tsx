import { useMemo, useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { ClientPickerField, createClientIdPickerHandlers, useClientPickerState } from '@/features/clients/public'
import { Modal, ModalFormActions } from '@/components/ui/overlays'
import type { BusinessResponse } from '@/features/clients'
import type { CreateChargePayload } from '../../api'
import { CHARGE_CREATE_FORM_ID } from '../../constants'
import { chargeCreateDefaultValues, chargeCreateSchema, toCreateChargePayload, type ChargeCreateFormValues } from '../../schemas'
import { getChargeBusinessLabel } from '../../utils/chargeUtils'
import { CHARGES_MESSAGES } from '../../messages'
import { ChargeCoreFields } from './ChargeCoreFields'

interface ChargesCreateModalProps {
  open: boolean
  createError: string | null
  createLoading: boolean
  onClose: () => void
  onSubmit: (payload: CreateChargePayload) => Promise<boolean>
  initialClient?: { id: number; name: string } | null
  initialBusiness?: { id: number; name: string } | null
  businesses?: BusinessResponse[]
}

const EMPTY_BUSINESSES: BusinessResponse[] = []

export const ChargesCreateModal: React.FC<ChargesCreateModalProps> = ({
  open,
  createError,
  createLoading,
  onClose,
  onSubmit,
  initialClient,
  initialBusiness,
  businesses = EMPTY_BUSINESSES,
}) => {
  const form = useForm<ChargeCreateFormValues>({
    defaultValues: chargeCreateDefaultValues,
    resolver: zodResolver(chargeCreateSchema),
  })
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
    setValue,
  } = form

  const { clientQuery, selectedClient, handleSelectClient, handleClearClient, handleClientQueryChange, resetClientPicker } =
    useClientPickerState(createClientIdPickerHandlers((value, options) => setValue('client_record_id', value, options)))

  const selectedSingleBusiness = useMemo(() => {
    if (initialBusiness) {
      return initialBusiness
    }

    if (businesses.length !== 1) {
      return null
    }

    const [business] = businesses
    return { id: business.id, name: getChargeBusinessLabel(business) }
  }, [businesses, initialBusiness])

  // Pre-select client when modal opens
  const didSeedRef = useRef(false)
  useEffect(() => {
    if (open && !didSeedRef.current) {
      if (initialClient) handleSelectClient({ id: initialClient.id, name: initialClient.name })
      didSeedRef.current = true
    }
    if (!open) {
      didSeedRef.current = false
    }
  }, [handleSelectClient, initialClient, open])

  useEffect(() => {
    if (!open || !selectedSingleBusiness) {
      return
    }

    setValue('business_id', selectedSingleBusiness.id, { shouldDirty: false })
  }, [open, selectedSingleBusiness, setValue])

  const businessOptions = useMemo(
    () => [
      { value: '', label: CHARGES_MESSAGES.create.noBusiness },
      ...businesses.map((b) => ({ value: String(b.id), label: getChargeBusinessLabel(b) })),
    ],
    [businesses],
  )

  const handleClose = () => {
    reset(chargeCreateDefaultValues)
    resetClientPicker()
    onClose()
  }

  const submitForm = handleSubmit(async (values) => {
    const created = await onSubmit(toCreateChargePayload(values))
    if (created) {
      reset(chargeCreateDefaultValues)
      resetClientPicker()
      onClose()
    }
  })

  return (
    <Modal
      open={open}
      title={CHARGES_MESSAGES.create.title}
      isDirty={isDirty}
      onClose={handleClose}
      footer={
        <ModalFormActions
          cancelVariant="secondary"
          isLoading={createLoading}
          submitType="submit"
          submitForm={CHARGE_CREATE_FORM_ID}
          submitLabel={CHARGES_MESSAGES.create.submit}
        />
      }
    >
      <form id={CHARGE_CREATE_FORM_ID} onSubmit={submitForm} className="space-y-4">
        <input type="hidden" {...register('client_record_id')} />
        <FormProvider {...form}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="col-span-2">
              <ClientPickerField
                selectedClient={selectedClient}
                clientQuery={clientQuery}
                onQueryChange={handleClientQueryChange}
                onSelect={handleSelectClient}
                onClear={handleClearClient}
                error={errors.client_record_id?.message}
                label={CHARGES_MESSAGES.create.client}
              />
            </div>
            <ChargeCoreFields
              businessOptions={businessOptions}
              showBusinessSelect={businesses.length > 1}
              singleBusinessLabel={businesses.length === 1 ? selectedSingleBusiness?.name : undefined}
            />
          </div>
        </FormProvider>

        {createError && <p className="text-sm text-negative-600">{createError}</p>}
      </form>
    </Modal>
  )
}

ChargesCreateModal.displayName = 'ChargesCreateModal'
