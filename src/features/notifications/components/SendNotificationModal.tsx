import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../../../components/ui/overlays/Modal'
import { Button } from '../../../components/ui/primitives/Button'
import { Select } from '../../../components/ui/inputs/Select'
import { Textarea } from '../../../components/ui/inputs/Textarea'
import { ClientPickerField, useClientPickerState } from '../../../components/shared/client'
import { useSendNotification } from '../hooks/useSendNotification'
import type { NotificationChannel } from '../api'

const CHANNEL_OPTIONS: { value: NotificationChannel; label: string }[] = [
  { value: 'email', label: 'אימייל' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

const schema = z.object({
  channel: z.enum(['email', 'whatsapp'] as const),
  message: z.string().min(1, 'נדרש תוכן הודעה').max(1000, 'מקסימום 1000 תווים'),
})

type FormValues = z.infer<typeof schema>

export interface SendNotificationModalProps {
  open: boolean
  onClose: () => void
  clientRecordId?: number
}

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  open,
  onClose,
  clientRecordId,
}) => {
  const { send, isSending } = useSendNotification()
  const [clientError, setClientError] = useState<string | undefined>()

  const { clientQuery, selectedClient, handleSelectClient, handleClearClient, handleClientQueryChange, resetClientPicker } =
    useClientPickerState()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { channel: 'email', message: '' },
  })

  useEffect(() => {
    if (open) {
      reset({ channel: 'email', message: '' })
      setClientError(undefined)
      resetClientPicker()
    }
  }, [open, reset, resetClientPicker])

  const resolvedClientRecordId = clientRecordId ?? selectedClient?.id

  const submit = handleSubmit((values) => {
    if (resolvedClientRecordId == null) {
      setClientError('יש לבחור לקוח')
      return
    }
    setClientError(undefined)
    send({ client_record_id: resolvedClientRecordId, preferred_channel: values.channel, message: values.message }, { onSuccess: onClose })
  })

  return (
    <Modal
      open={open}
      title="שליחת הודעה ידנית"
      onClose={onClose}
      footer={
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" disabled={isSending} onClick={onClose}>
            ביטול
          </Button>
          <Button type="button" isLoading={isSending} disabled={isSending} onClick={submit}>
            שלח
          </Button>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4" dir="rtl">
        {clientRecordId == null && (
          <ClientPickerField
            selectedClient={selectedClient}
            clientQuery={clientQuery}
            onQueryChange={handleClientQueryChange}
            onSelect={handleSelectClient}
            onClear={handleClearClient}
            error={clientError}
          />
        )}
        <Select
          label="ערוץ שליחה"
          error={errors.channel?.message}
          options={CHANNEL_OPTIONS}
          {...register('channel')}
        />
        <Textarea
          label="תוכן ההודעה"
          rows={5}
          placeholder="הזן את תוכן ההודעה..."
          error={errors.message?.message}
          {...register('message')}
        />
      </form>
    </Modal>
  )
}

SendNotificationModal.displayName = 'SendNotificationModal'
