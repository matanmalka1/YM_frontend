import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { MONTHS_COVERED_OPTIONS } from '@/constants/periodOptions.constants'
import { Input, Select, Textarea } from '@/components/ui/inputs'
import { Modal, ModalFormActions } from '@/components/ui/overlays'
import { useBusinessesForClient } from '@/hooks/useBusinessesForClient'
import type { ChargeResponse } from '../../api'
import { CHARGE_EDIT_FORM_ID, CHARGE_TYPE_OPTIONS } from '../../constants'
import { chargeEditSchema, toChargeEditDefaultValues, toUpdateChargePayload, type ChargeEditFormValues } from '../../schemas'
import { buildChargePeriodOptions } from '../../utils/chargeHelpers'
import { getChargeBusinessLabel } from '../../utils/chargeUtils'
import { CHARGES_MESSAGES } from '../../messages'

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
  const {
    formState: { errors, isDirty },
    handleSubmit,
    control,
    register,
    reset,
    watch,
  } = useForm<ChargeEditFormValues>({
    defaultValues: toChargeEditDefaultValues(charge),
    resolver: zodResolver(chargeEditSchema),
  })

  // Re-seed when a different charge is opened, or after a refetch changes the row.
  useEffect(() => {
    if (open) reset(toChargeEditDefaultValues(charge))
  }, [charge, open, reset])

  const { businesses } = useBusinessesForClient({ clientId: charge.client_record_id, enabled: open })

  const monthsCovered = watch('months_covered') ?? 1
  const periodOptions = useMemo(() => buildChargePeriodOptions(monthsCovered), [monthsCovered])

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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {businesses.length > 1 && (
            <div className="col-span-2">
              <Controller
                control={control}
                name="business_id"
                render={({ field }) => (
                  <Select
                    label={CHARGES_MESSAGES.create.business}
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

          <Input
            label={CHARGES_MESSAGES.create.amount}
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
                label={CHARGES_MESSAGES.create.type}
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
                label={CHARGES_MESSAGES.create.monthsCovered}
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
                label={CHARGES_MESSAGES.create.period}
                error={errors.period?.message}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                name={field.name}
                options={periodOptions}
              />
            )}
          />
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

        {updateError && <p className="text-sm text-negative-600">{updateError}</p>}
      </form>
    </Modal>
  )
}

ChargeEditModal.displayName = 'ChargeEditModal'
