import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../../../../components/ui/overlays/Modal'
import { ModalFormActions } from '../../../../components/ui/overlays/ModalFormActions'
import { Input } from '../../../../components/ui/inputs/Input'
import { Select } from '../../../../components/ui/inputs/Select'
import { Textarea } from '../../../../components/ui/inputs/Textarea'
import { ClientSearchInput, SelectedClientDisplay } from '@/features/clients/public'
import type { CreateSignatureRequestPayload } from '../../api'
import { getSignatureRequestTypeLabel, SIGNATURE_REQUEST_TYPE_VALUES } from '../../constants'
import { SIGNATURE_REQUESTS_MESSAGES } from '../../messages'
import {
  signatureRequestCreateFormSchema,
  toCreateSignatureRequestPayload,
  type SignatureRequestCreateFormValues,
} from '../../schemas'
const CREATE_SIGNATURE_REQUEST_FORM_ID = 'create-signature-request-form'

interface Props {
  open: boolean
  clientId?: number
  businessId?: number
  signerName?: string
  signerEmail?: string
  signerPhone?: string
  isLoading: boolean
  onClose: () => void
  onCreate: (payload: CreateSignatureRequestPayload) => Promise<unknown>
}

export const CreateSignatureRequestModal: React.FC<Props> = ({
  open,
  clientId: initialClientId,
  businessId,
  signerName: initialSignerName = '',
  signerEmail,
  signerPhone,
  isLoading,
  onClose,
  onCreate,
}) => {
  const [selectedClient, setSelectedClient] = useState<{
    id: number
    name: string
    office_client_number?: number | null
  } | null>(initialClientId != null ? { id: initialClientId, name: initialSignerName } : null)
  const [clientQuery, setClientQuery] = useState('')
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SignatureRequestCreateFormValues>({
    resolver: zodResolver(signatureRequestCreateFormSchema),
    defaultValues: {
      client_record_id: initialClientId,
      request_type: 'engagement_agreement',
      title: '',
      description: '',
      signer_name: initialSignerName,
      signer_email: signerEmail ?? '',
      signer_phone: signerPhone ?? '',
    },
  })

  const handleClose = () => {
    onClose()
    reset({
      client_record_id: initialClientId,
      request_type: 'engagement_agreement',
      title: '',
      description: '',
      signer_name: initialSignerName,
      signer_email: signerEmail ?? '',
      signer_phone: signerPhone ?? '',
    })
    if (initialClientId == null) {
      setSelectedClient(null)
      setClientQuery('')
    }
  }

  const submit = handleSubmit(async (values) => {
    const parsed = signatureRequestCreateFormSchema.parse(values)
    await onCreate(toCreateSignatureRequestPayload(parsed, businessId))
    handleClose()
  })

  return (
    <Modal
      open={open}
      title={SIGNATURE_REQUESTS_MESSAGES.form.title}
      onClose={handleClose}
      footer={
        <ModalFormActions
          onCancel={handleClose}
          submitForm={CREATE_SIGNATURE_REQUEST_FORM_ID}
          submitType="submit"
          submitLabel={SIGNATURE_REQUESTS_MESSAGES.actions.createAndSend}
          isLoading={isLoading}
          submitDisabled={isLoading}
        />
      }
    >
      <form id={CREATE_SIGNATURE_REQUEST_FORM_ID} onSubmit={submit} className="space-y-4">
        {initialClientId == null &&
          (selectedClient ? (
            <SelectedClientDisplay
              name={selectedClient.name}
              officeClientNumber={selectedClient.office_client_number}
              onClear={() => {
                setSelectedClient(null)
                setClientQuery('')
                setValue('client_record_id', 0, { shouldValidate: true })
                setValue('signer_name', '')
              }}
            />
          ) : (
            <ClientSearchInput
              value={clientQuery}
              onChange={setClientQuery}
              onSelect={(c) => {
                setSelectedClient({ id: c.id, name: c.name, office_client_number: c.office_client_number })
                setValue('client_record_id', c.id, { shouldValidate: true })
                setValue('signer_name', c.name)
                setClientQuery(c.name)
              }}
            />
          ))}
        <Controller
          control={control}
          name="request_type"
          render={({ field }) => (
            <Select
              label={SIGNATURE_REQUESTS_MESSAGES.form.documentType}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              options={SIGNATURE_REQUEST_TYPE_VALUES.map((type) => ({
                value: type,
                label: getSignatureRequestTypeLabel(type),
              }))}
            />
          )}
        />
        <Input
          {...register('title')}
          label={SIGNATURE_REQUESTS_MESSAGES.form.requestTitle}
          error={errors.title?.message}
          placeholder={SIGNATURE_REQUESTS_MESSAGES.form.titlePlaceholder}
        />
        <Textarea
          {...register('description')}
          label={SIGNATURE_REQUESTS_MESSAGES.form.description}
          error={errors.description?.message}
          placeholder={SIGNATURE_REQUESTS_MESSAGES.form.descriptionPlaceholder}
          rows={3}
        />
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500 mb-3">{SIGNATURE_REQUESTS_MESSAGES.form.signerDetails}</p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              {...register('signer_name')}
              label={SIGNATURE_REQUESTS_MESSAGES.form.signerName}
              error={errors.signer_name?.message}
              placeholder={initialSignerName || selectedClient?.name || ''}
            />
            <Input
              {...register('signer_email')}
              label={SIGNATURE_REQUESTS_MESSAGES.form.signerEmail}
              error={errors.signer_email?.message}
              placeholder={signerEmail ?? ''}
              type="email"
            />
            <Input
              {...register('signer_phone')}
              label={SIGNATURE_REQUESTS_MESSAGES.form.signerPhone}
              placeholder={signerPhone ?? ''}
              type="tel"
              dir="ltr"
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}

CreateSignatureRequestModal.displayName = 'CreateSignatureRequestModal'
