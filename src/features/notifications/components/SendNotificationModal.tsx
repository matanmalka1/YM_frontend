import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Modal } from '../../../components/ui/overlays/Modal'
import { Button } from '../../../components/ui/primitives/Button'
import { Textarea } from '../../../components/ui/inputs/Textarea'
import { Select } from '../../../components/ui/inputs/Select'
import { ClientSearchInput, SelectedClientDisplay } from '@/components/shared/client'
import { formatPhoneNumber } from '@/utils/utils'
import { useSendNotification } from '../hooks/useSendNotification'
import { useClientForNotification } from '../hooks/useClientForNotification'
import type { SendNotificationModalProps } from '../types'

interface FormValues {
  channel: 'whatsapp' | 'email'
  message: string
}

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({ open, onClose, clientId }) => {
  const [clientQuery, setClientQuery] = useState('')
  const [clientError, setClientError] = useState<string | undefined>()

  const {
    selectedClient,
    selectedBusinessId,
    clientContact,
    selectClient,
    clearClient,
    reset: resetClient,
  } = useClientForNotification(clientId)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: { channel: 'email', message: '' },
  })

  const channel = useWatch({ control, name: 'channel' })

  const resetRef = useRef(reset)
  resetRef.current = reset
  const resetClientRef = useRef(resetClient)
  resetClientRef.current = resetClient

  useEffect(() => {
    if (open) {
      resetRef.current({ channel: 'email', message: '' })
      setClientQuery('')
      setClientError(undefined)
      resetClientRef.current(clientId)
    }
  }, [open, clientId])

  const { sendNotification, isSending } = useSendNotification(onClose)

  const onSubmit = (values: FormValues) => {
    if (!selectedClient) {
      setClientError('שדה חובה')
      return
    }
    if (!selectedBusinessId) {
      setClientError('לא נמצא עסק פעיל ללקוח זה')
      return
    }
    setClientError(undefined)
    sendNotification({
      business_id: selectedBusinessId,
      channel: values.channel,
      message: values.message,
    })
  }

  return (
    <Modal
      open={open}
      title="שלח הודעה"
      onClose={onClose}
      isDirty={isDirty}
      footer={
        <div className="flex gap-2 justify-start" dir="rtl">
          <Button type="submit" form="send-notification-form" disabled={isSending}>
            {isSending ? 'שולח...' : 'שלח'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSending}>
            ביטול
          </Button>
        </div>
      }
    >
      <form id="send-notification-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
        <div className="space-y-1">
          {clientId != null ? (
            <SelectedClientDisplay
              label="לקוח"
              name={selectedClient?.name || `לקוח #${clientId}`}
              id={clientId}
              onClear={() => {}}
            />
          ) : selectedClient ? (
            <SelectedClientDisplay
              label="לקוח"
              name={selectedClient.name}
              id={selectedClient.id}
              onClear={() => {
                clearClient()
                setClientQuery('')
              }}
            />
          ) : (
            <ClientSearchInput
              label="לקוח"
              value={clientQuery}
              onChange={setClientQuery}
              onSelect={async (c) => {
                setClientError(undefined)
                await selectClient({ id: c.id, name: c.name })
              }}
              error={clientError}
              placeholder="חפש לפי שם, ת.ז. / ח.פ..."
            />
          )}
          {selectedClient && clientContact && (
            <p className="text-xs text-gray-500 pe-1">
              {channel === 'whatsapp'
                ? clientContact.phone
                  ? formatPhoneNumber(clientContact.phone)
                  : 'אין מספר טלפון ללקוח'
                : (clientContact.email ?? 'אין כתובת אימייל ללקוח')}
            </p>
          )}
        </div>

        <div>
          <Select
            label="ערוץ שליחה"
            options={[
              { value: 'email', label: 'אימייל' },
              { value: 'whatsapp', label: 'וואטסאפ' },
            ]}
            {...register('channel', { required: true })}
          />
        </div>

        <div>
          <Textarea
            label="תוכן ההודעה"
            {...register('message', {
              required: 'שדה חובה',
              maxLength: { value: 1000, message: 'עד 1000 תווים' },
            })}
            rows={4}
            placeholder="הכנס את תוכן ההודעה..."
          />
          {errors.message && <p className="mt-1 text-xs text-negative-600">{errors.message.message}</p>}
        </div>
      </form>
    </Modal>
  )
}

SendNotificationModal.displayName = 'SendNotificationModal'
