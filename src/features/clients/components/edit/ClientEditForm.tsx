import { useEffect, useRef, useState } from 'react'
import { useController, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../../../components/ui/primitives/Button'
import { ConfirmDialog } from '../../../../components/ui/overlays/ConfirmDialog'
import type { ClientRecordResponse, UpdateClientPayload } from '../../api'
import { clientEditSchema, type ClientEditFormValues } from '../../schemas'
import { buildClientEditImpactMessage } from '../../utils/clientEditImpact'
import { buildClientUpdatePayload, hasClientUpdatePayload } from '../../utils/buildClientUpdatePayload'
import {
  ClientContactSection,
  ClientIdentitySection,
  ClientOfficeSection,
  ClientTaxProfileSection,
} from './ClientEditFormSections'

interface ClientEditFormProps {
  client: ClientRecordResponse
  onSave: (data: UpdateClientPayload) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  /** When true, the form renders without its own action buttons (parent renders them). */
  hideFooter?: boolean
  /** Exposed form id so a parent can submit via <button form="...">. */
  formId?: string
  /** Notifies the parent when the form's dirty state changes (for the unsaved-changes guard). */
  onDirtyChange?: (isDirty: boolean) => void
}

const getClientDefaultValues = (client: ClientRecordResponse): ClientEditFormValues => ({
  full_name: client.full_name,
  status: client.status,
  phone: client.phone ?? '',
  email: client.email ?? '',
  address_street: client.address_street ?? '',
  address_building_number: client.address_building_number ?? '',
  address_apartment: client.address_apartment ?? '',
  address_city: client.address_city ?? '',
  address_zip_code: client.address_zip_code ?? '',
  entity_type: client.entity_type ?? null,
  vat_reporting_frequency: client.vat_reporting_frequency ?? null,
  advance_payment_frequency: client.advance_payment_frequency ?? null,
  advance_rate: client.advance_rate ?? '',
  annual_revenue: client.annual_revenue ?? '',
  accountant_id: client.accountant_id != null ? String(client.accountant_id) : '',
})

export const ClientEditForm: React.FC<ClientEditFormProps> = ({
  client,
  onSave,
  onCancel,
  isLoading = false,
  hideFooter = false,
  formId,
  onDirtyChange,
}) => {
  const pendingDataRef = useRef<UpdateClientPayload | null>(null)
  const [impactMessage, setImpactMessage] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<ClientEditFormValues>({
    resolver: zodResolver(clientEditSchema),
    defaultValues: getClientDefaultValues(client),
  })
  const { field: statusField } = useController({ name: 'status', control })
  const { field: entityTypeField } = useController({ name: 'entity_type', control })
  const { field: accountantIdField } = useController({ name: 'accountant_id', control })

  const isOsekPatur = entityTypeField.value === 'osek_patur'
  const { field: vatReportingFrequencyField } = useController({
    name: 'vat_reporting_frequency',
    control,
  })
  const { field: advancePaymentFrequencyField } = useController({
    name: 'advance_payment_frequency',
    control,
  })

  useEffect(() => {
    reset(getClientDefaultValues(client))
  }, [client, reset])

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  useEffect(() => {
    if (isOsekPatur && vatReportingFrequencyField.value != null) {
      setValue('vat_reporting_frequency', null, {
        shouldDirty: Boolean(dirtyFields.entity_type),
        shouldValidate: true,
      })
    }
  }, [dirtyFields.entity_type, isOsekPatur, setValue, vatReportingFrequencyField.value])

  const onSubmit = handleSubmit(async (data) => {
    const payload = buildClientUpdatePayload(data, dirtyFields)
    if (!hasClientUpdatePayload(payload)) return

    const msg = buildClientEditImpactMessage(client.status, data.status, client.entity_type, data.entity_type)
    if (msg) {
      pendingDataRef.current = payload
      setImpactMessage(msg)
      return
    }
    await onSave(payload)
  })

  const handleConfirm = async () => {
    const data = pendingDataRef.current
    if (!data) return
    pendingDataRef.current = null
    setImpactMessage(null)
    await onSave(data)
  }

  const handleCancelConfirm = () => {
    pendingDataRef.current = null
    setImpactMessage(null)
  }

  return (
    <>
      <ConfirmDialog
        open={!!impactMessage}
        title="אזהרה: פעולה בלתי הפיכה"
        message={impactMessage ?? ''}
        confirmLabel="אישור ושמירה"
        cancelLabel="ביטול"
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />
      <form id={formId} onSubmit={onSubmit} className="space-y-6">
        <ClientIdentitySection
          client={client}
          errors={errors}
          isLoading={isLoading}
          register={register}
          entityTypeField={entityTypeField}
        />
        <ClientContactSection client={client} errors={errors} isLoading={isLoading} register={register} />
        <ClientTaxProfileSection
          client={client}
          errors={errors}
          isLoading={isLoading}
          register={register}
          isOsekPatur={isOsekPatur}
          vatReportingFrequencyField={vatReportingFrequencyField}
          advancePaymentFrequencyField={advancePaymentFrequencyField}
        />
        <ClientOfficeSection
          client={client}
          errors={errors}
          isLoading={isLoading}
          register={register}
          statusField={statusField}
          accountantIdField={accountantIdField}
        />

        {!hideFooter && (
          <>
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                ביטול
              </Button>
              <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading || !isDirty}>
                שמור שינויים
              </Button>
            </div>

            {!isDirty && <p className="text-center text-sm text-gray-500">לא בוצעו שינויים בטופס</p>}
          </>
        )}
      </form>
    </>
  )
}
