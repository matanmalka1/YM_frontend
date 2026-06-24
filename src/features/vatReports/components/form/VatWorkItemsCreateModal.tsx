import { useCallback, useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ClientPickerField, useClientPickerState } from '@/components/shared/client'
import { Input } from '@/components/ui/inputs'
import { Checkbox } from '@/components/ui/primitives/Checkbox'
import { Modal, ModalFormActions } from '@/components/ui/overlays'
import { VatPeriodSelect } from './VatPeriodSelect'
import {
  vatWorkItemCreateDefaultValues,
  vatWorkItemCreateSchema,
  toCreateVatWorkItemPayload,
  type VatWorkItemCreateFormValues,
} from '../../schemas/workItem.schema'
import type { VatWorkItemsCreateModalProps } from '../../types'
import { VAT_MESSAGES } from '../../messages'

export const VatWorkItemsCreateModal: React.FC<VatWorkItemsCreateModalProps> = ({
  open,
  createError,
  createLoading,
  onClose,
  onSubmit,
  initialClientId,
  initialPeriod,
}) => {
  const {
    formState: { errors, isDirty, submitCount, touchedFields },
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    clearErrors,
  } = useForm<VatWorkItemCreateFormValues>({
    defaultValues: vatWorkItemCreateDefaultValues,
    resolver: zodResolver(vatWorkItemCreateSchema),
  })

  const resetPeriodField = useCallback(() => {
    setValue('period', '', { shouldDirty: true, shouldValidate: false })
    clearErrors('period')
  }, [clearErrors, setValue])

  const resetClientSelection = useCallback(() => {
    setValue('client_id', '', { shouldDirty: true, shouldValidate: false })
    clearErrors('client_id')
    resetPeriodField()
  }, [clearErrors, resetPeriodField, setValue])

  const {
    clientQuery,
    selectedClient,
    handleSelectClient,
    handleClearClient,
    handleClientQueryChange,
    resetClientPicker,
  } = useClientPickerState({
    onSelect: resetPeriodField,
    onClear: resetClientSelection,
  })

  const clientIdValue = watch('client_id')
  const periodValue = watch('period')
  const clientId = Number(clientIdValue)

  // When a client is selected via picker, sync client_id
  useEffect(() => {
    if (selectedClient) {
      setValue('client_id', String(selectedClient.id), { shouldValidate: false })
      clearErrors('client_id')
    }
  }, [clearErrors, selectedClient, setValue])

  useEffect(() => {
    if (open && initialClientId !== undefined) {
      setValue('client_id', String(initialClientId))
    }
    if (open && initialPeriod) {
      setValue('period', initialPeriod)
    }
  }, [open, initialClientId, initialPeriod, setValue])

  useEffect(() => {
    if (!open || initialClientId !== undefined) return
    setValue('period', '')
  }, [open, initialClientId, clientIdValue, setValue])

  const periodYear = useMemo(() => {
    if (initialPeriod && /^\d{4}-/.test(initialPeriod)) {
      return Number(initialPeriod.slice(0, 4))
    }
    return new Date().getFullYear()
  }, [initialPeriod])

  const handleClose = () => {
    reset(vatWorkItemCreateDefaultValues)
    resetClientPicker()
    onClose()
  }

  const submitForm = handleSubmit(async (values) => {
    const created = await onSubmit(toCreateVatWorkItemPayload(values))
    if (created) handleClose()
  })

  const colSpanClass = initialClientId !== undefined ? 'col-span-2' : ''
  const showClientError = submitCount > 0 || Boolean(touchedFields.client_id)
  const showPeriodError = submitCount > 0 || Boolean(touchedFields.period)

  return (
    <Modal
      open={open}
      title={VAT_MESSAGES.form.createModalTitle}
      isDirty={isDirty}
      onClose={handleClose}
      footer={
        <ModalFormActions
          cancelVariant="secondary"
          isLoading={createLoading}
          submitType="submit"
          submitForm="vat-work-items-create-form"
          submitLabel={VAT_MESSAGES.form.createSubmitLabel}
        />
      }
    >
      <form id="vat-work-items-create-form" onSubmit={submitForm} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {initialClientId === undefined && (
            <div className="col-span-2">
              <ClientPickerField
                selectedClient={selectedClient}
                clientQuery={clientQuery}
                onQueryChange={handleClientQueryChange}
                onSelect={handleSelectClient}
                onClear={handleClearClient}
                label={VAT_MESSAGES.form.clientLabel}
                error={showClientError ? errors.client_id?.message : undefined}
              />
              <input type="hidden" {...register('client_id')} />
            </div>
          )}
          <VatPeriodSelect
            clientId={clientId}
            year={periodYear}
            value={periodValue}
            onChange={(value) => {
              setValue('period', value, {
                shouldDirty: true,
                shouldValidate: submitCount > 0,
                shouldTouch: true,
              })
              if (value) clearErrors('period')
            }}
            error={showPeriodError ? errors.period?.message : undefined}
            className={colSpanClass}
            enabled={open}
          />
          <input type="hidden" {...register('period')} />
        </div>

        <Checkbox label={VAT_MESSAGES.form.pendingMaterialsLabel} {...register('mark_pending')} />

        {watch('mark_pending') && (
          <Input
            label={VAT_MESSAGES.form.pendingMaterialsNoteLabel}
            placeholder={VAT_MESSAGES.form.pendingMaterialsNotePlaceholder}
            error={errors.pending_materials_note?.message}
            {...register('pending_materials_note')}
          />
        )}

        {createError && <p className="text-sm text-negative-600">{createError}</p>}
      </form>
    </Modal>
  )
}

VatWorkItemsCreateModal.displayName = 'VatWorkItemsCreateModal'
