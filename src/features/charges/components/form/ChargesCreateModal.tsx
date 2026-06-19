import { useMemo, useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { ClientPickerField, createClientIdPickerHandlers, useClientPickerState } from '@/components/shared/client'
import { MONTHS_COVERED_OPTIONS } from '@/constants/periodOptions.constants'
import { FormField, Input, Select } from '@/components/ui/inputs'
import { Modal, ModalFormActions } from '@/components/ui/overlays'
import type { BusinessResponse } from '@/features/clients'
import type { CreateChargePayload } from '../../api'
import { CHARGE_CREATE_FORM_ID, CHARGE_TYPE_OPTIONS } from '../../constants'
import {
  chargeCreateDefaultValues,
  chargeCreateSchema,
  toCreateChargePayload,
  type ChargeCreateFormValues,
} from '../../schemas'
import { buildChargePeriodOptions } from '../../utils/chargeHelpers'

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

export const ChargesCreateModal: React.FC<ChargesCreateModalProps> = ({
  open,
  createError,
  createLoading,
  onClose,
  onSubmit,
  initialClient,
  initialBusiness,
  businesses = [],
}) => {
  const {
    formState: { errors, isDirty },
    handleSubmit,
    control,
    register,
    reset,
    setValue,
    watch,
  } = useForm<ChargeCreateFormValues>({
    defaultValues: chargeCreateDefaultValues,
    resolver: zodResolver(chargeCreateSchema),
  })

  const {
    clientQuery,
    selectedClient,
    handleSelectClient,
    handleClearClient,
    handleClientQueryChange,
    resetClientPicker,
  } = useClientPickerState(
    createClientIdPickerHandlers((value, options) => setValue('client_record_id', value, options)),
  )

  const selectedSingleBusiness = useMemo(() => {
    if (initialBusiness) {
      return initialBusiness
    }

    if (businesses.length !== 1) {
      return null
    }

    const [business] = businesses
    return {
      id: business.id,
      name: business.business_name ?? `עסק #${business.id}`,
    }
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

  const monthsCovered = watch('months_covered') ?? 1
  const periodOptions = useMemo(() => buildChargePeriodOptions(monthsCovered), [monthsCovered])

  const businessOptions = useMemo(
    () => [
      { value: '', label: 'ללא שיוך עסקי' },
      ...businesses.map((b) => ({ value: String(b.id), label: b.business_name ?? `עסק #${b.id}` })),
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
      title="יצירת חיוב חדש"
      isDirty={isDirty}
      onClose={handleClose}
      footer={
        <ModalFormActions
          onCancel={handleClose}
          cancelVariant="secondary"
          isLoading={createLoading}
          submitType="submit"
          submitForm={CHARGE_CREATE_FORM_ID}
          submitLabel="יצירת חיוב"
        />
      }
    >
      <form id={CHARGE_CREATE_FORM_ID} onSubmit={submitForm} className="space-y-4">
        <input type="hidden" {...register('client_record_id')} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="col-span-2">
            <ClientPickerField
              selectedClient={selectedClient}
              clientQuery={clientQuery}
              onQueryChange={handleClientQueryChange}
              onSelect={handleSelectClient}
              onClear={handleClearClient}
              error={errors.client_record_id?.message}
              label="לקוח *"
            />
          </div>

          {businesses.length > 1 && (
            <div className="col-span-2">
              <Controller
                control={control}
                name="business_id"
                render={({ field }) => (
                  <Select
                    label="עסק"
                    value={field.value != null ? String(field.value) : ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    onBlur={field.onBlur}
                    name={field.name}
                    options={businessOptions}
                  />
                )}
              />
            </div>
          )}

          {businesses.length === 1 && selectedSingleBusiness && (
            <div className="col-span-2">
              <FormField label="עסק">
                <Input value={selectedSingleBusiness.name} readOnly disabled />
              </FormField>
            </div>
          )}

          <Input
            label="סכום *"
            type="number"
            min={0.01}
            step="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            endElement={<span className="text-sm text-gray-400">₪</span>}
            {...register('amount')}
          />
          <Controller
            control={control}
            name="charge_type"
            render={({ field }) => (
              <Select
                label="סוג חיוב *"
                error={errors.charge_type?.message}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                options={CHARGE_TYPE_OPTIONS}
              />
            )}
          />
          <Controller
            control={control}
            name="months_covered"
            render={({ field }) => (
              <Select
                label="חודשים לחיוב"
                error={errors.months_covered?.message}
                value={field.value != null ? String(field.value) : '1'}
                onChange={(e) => field.onChange(Number(e.target.value) as 1 | 2)}
                onBlur={field.onBlur}
                name={field.name}
                options={MONTHS_COVERED_OPTIONS}
              />
            )}
          />
          <Controller
            control={control}
            name="period"
            render={({ field }) => (
              <Select
                label="תקופה"
                error={errors.period?.message}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                name={field.name}
                options={periodOptions}
              />
            )}
          />
        </div>

        {createError && <p className="text-sm text-negative-600">{createError}</p>}
      </form>
    </Modal>
  )
}

ChargesCreateModal.displayName = 'ChargesCreateModal'
