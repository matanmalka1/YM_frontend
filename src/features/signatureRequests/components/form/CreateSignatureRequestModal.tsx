import { useState } from 'react'
import { Modal } from '../../../../components/ui/overlays/Modal'
import { ModalFormActions } from '../../../../components/ui/overlays/ModalFormActions'
import { Input } from '../../../../components/ui/inputs/Input'
import { Select } from '../../../../components/ui/inputs/Select'
import { Textarea } from '../../../../components/ui/inputs/Textarea'
import { ClientSearchInput, SelectedClientDisplay } from '@/components/shared/client'
import type { CreateSignatureRequestPayload, SignatureRequestType } from '../../api'
import { getSignatureRequestTypeLabel } from '../../constants'
import { SIGNATURE_REQUESTS_MESSAGES } from '../../messages'

const REQUEST_TYPES: SignatureRequestType[] = [
  'engagement_agreement',
  'annual_report_approval',
  'power_of_attorney',
  'vat_return_approval',
  'custom',
]
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
  const [requestType, setRequestType] = useState<SignatureRequestType>('engagement_agreement')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [overrideName, setOverrideName] = useState(initialSignerName)
  const [overrideEmail, setOverrideEmail] = useState(signerEmail ?? '')

  const resolvedClientId = initialClientId ?? selectedClient?.id
  const resolvedSignerName = initialSignerName || selectedClient?.name || ''

  const handleClose = () => {
    onClose()
    setTitle('')
    setDescription('')
    setOverrideName(initialSignerName)
    setOverrideEmail(signerEmail ?? '')
    if (initialClientId == null) {
      setSelectedClient(null)
      setClientQuery('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const resolvedSignerNameFinal = overrideName.trim() || resolvedSignerName
    if (!title.trim() || !resolvedClientId || !resolvedSignerNameFinal) return
    await onCreate({
      client_record_id: resolvedClientId,
      business_id: businessId,
      request_type: requestType,
      title: title.trim(),
      description: description.trim() || undefined,
      signer_name: resolvedSignerNameFinal,
      signer_email: overrideEmail.trim() || undefined,
    })
    handleClose()
  }

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
      <form id={CREATE_SIGNATURE_REQUEST_FORM_ID} onSubmit={handleSubmit} className="space-y-4">
        {initialClientId == null &&
          (selectedClient ? (
            <SelectedClientDisplay
              name={selectedClient.name}
              officeClientNumber={selectedClient.office_client_number}
              onClear={() => {
                setSelectedClient(null)
                setClientQuery('')
                setOverrideName('')
              }}
            />
          ) : (
            <ClientSearchInput
              value={clientQuery}
              onChange={setClientQuery}
              onSelect={(c) => {
                setSelectedClient({ id: c.id, name: c.name, office_client_number: c.office_client_number })
                setOverrideName(c.name)
                setClientQuery(c.name)
              }}
            />
          ))}
        <Select
          label={SIGNATURE_REQUESTS_MESSAGES.form.documentType}
          value={requestType}
          onChange={(e) => setRequestType(e.target.value as SignatureRequestType)}
          options={REQUEST_TYPES.map((t) => ({
            value: t,
            label: getSignatureRequestTypeLabel(t),
          }))}
          required
        />
        <Input
          label={SIGNATURE_REQUESTS_MESSAGES.form.requestTitle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={SIGNATURE_REQUESTS_MESSAGES.form.titlePlaceholder}
          required
        />
        <Textarea
          label={SIGNATURE_REQUESTS_MESSAGES.form.description}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={SIGNATURE_REQUESTS_MESSAGES.form.descriptionPlaceholder}
          rows={3}
        />
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500 mb-3">{SIGNATURE_REQUESTS_MESSAGES.form.signerDetails}</p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={SIGNATURE_REQUESTS_MESSAGES.form.signerName}
              value={overrideName}
              onChange={(e) => setOverrideName(e.target.value)}
              placeholder={resolvedSignerName}
              required
            />
            <Input
              label={SIGNATURE_REQUESTS_MESSAGES.form.signerEmail}
              value={overrideEmail}
              onChange={(e) => setOverrideEmail(e.target.value)}
              placeholder={signerEmail ?? ''}
              type="email"
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}

CreateSignatureRequestModal.displayName = 'CreateSignatureRequestModal'
