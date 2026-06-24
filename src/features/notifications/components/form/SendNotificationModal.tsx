import { useEffect, useMemo, useRef, useState } from 'react'
import { Modal } from '../../../../components/ui/overlays/Modal'
import { Alert } from '../../../../components/ui/overlays/Alert'
import { Button } from '../../../../components/ui/primitives/Button'
import { Select } from '../../../../components/ui/inputs/Select'
import { Input } from '../../../../components/ui/inputs/Input'
import { Textarea } from '../../../../components/ui/inputs/Textarea'
import { ClientPickerField, useClientPickerState } from '../../../../components/shared/client'
import { usePreviewNotification, useSendNotification } from '../../hooks/useSendNotification'
import { CLIENT_LEVEL_MANUAL_NOTIFICATION_TRIGGERS, TRIGGER_LABELS, isNotificationTrigger } from '../../api'
import type { NotificationTrigger } from '../../api'

const DOMAIN_LABELS: Partial<Record<NotificationTrigger, string>> = {
  binder_missing_documents: 'קלסר',
  binder_general_reminder: 'קלסר',
  invoice_issued: 'חיובים',
  payment_reminder: 'חיובים',
  vat_documents_reminder: 'מע"מ',
  annual_report_documents_request: 'דוח שנתי',
  annual_report_client_reminder: 'דוח שנתי',
  signature_request_sent: 'חתימה',
  signature_request_reminder: 'חתימה',
  client_missing_information: 'לקוח',
  client_documents_request: 'לקוח',
  client_general_message: 'לקוח',
}

const buildTriggerOptions = (triggers: readonly NotificationTrigger[]) =>
  triggers.map((trigger) => ({
    value: trigger,
    label: `${DOMAIN_LABELS[trigger] ?? 'כללי'} — ${TRIGGER_LABELS[trigger]}`,
  }))

export interface SendNotificationModalProps {
  open: boolean
  onClose: () => void
  clientRecordId?: number
  initialTrigger?: NotificationTrigger
  entityId?: number
  disableTriggerChange?: boolean
  allowedTriggers?: readonly NotificationTrigger[]
}

type Step = 'compose' | 'preview'

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  open,
  onClose,
  clientRecordId,
  initialTrigger,
  entityId,
  disableTriggerChange = false,
  allowedTriggers,
}) => {
  const { previewAsync, isPreviewing } = usePreviewNotification()
  const { sendAsync, isSending } = useSendNotification()

  const availableTriggers = useMemo<readonly NotificationTrigger[]>(() => {
    const base =
      allowedTriggers && allowedTriggers.length > 0 ? allowedTriggers : CLIENT_LEVEL_MANUAL_NOTIFICATION_TRIGGERS
    if (initialTrigger && !base.includes(initialTrigger)) {
      return [initialTrigger, ...base]
    }
    return base
  }, [allowedTriggers, initialTrigger])
  const defaultTrigger = initialTrigger ?? availableTriggers[0]
  const triggerOptions = buildTriggerOptions(availableTriggers)

  const [step, setStep] = useState<Step>('compose')
  const [trigger, setTrigger] = useState<NotificationTrigger>(defaultTrigger)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [subjectError, setSubjectError] = useState<string | undefined>()
  const [bodyError, setBodyError] = useState<string | undefined>()
  const [clientError, setClientError] = useState<string | undefined>()
  const [blockedReason, setBlockedReason] = useState<string | undefined>()
  const [warnings, setWarnings] = useState<string[]>([])

  const {
    clientQuery,
    selectedClient,
    handleSelectClient,
    handleClearClient,
    handleClientQueryChange,
    resetClientPicker,
  } = useClientPickerState()

  const resolvedClientRecordId = clientRecordId ?? selectedClient?.id

  const handleTriggerChange = (value: string) => {
    if (!isNotificationTrigger(value)) return
    setTrigger(value)
    setBlockedReason(undefined)
  }

  const handlePreview = async (overrideClientId?: number) => {
    const cid = overrideClientId ?? resolvedClientRecordId
    if (cid == null) {
      setClientError('יש לבחור לקוח')
      return
    }
    setClientError(undefined)
    setBlockedReason(undefined)
    setWarnings([])

    const result = await previewAsync({
      client_record_id: cid,
      trigger,
      entity_id: entityId,
    })
    if (result.status === 'blocked') {
      setBlockedReason(result.reason ?? 'שליחת ההודעה חסומה')
      return
    }
    setSubject(result.subject ?? '')
    setBody(result.body ?? '')
    if (result.warnings?.length) setWarnings(result.warnings)
    setStep('preview')
  }

  // Reset state on open
  useEffect(() => {
    if (!open) return
    setStep('compose')
    setTrigger(defaultTrigger)
    setSubject('')
    setBody('')
    setSubjectError(undefined)
    setBodyError(undefined)
    setClientError(undefined)
    setBlockedReason(undefined)
    setWarnings([])
    resetClientPicker()
  }, [defaultTrigger, open, resetClientPicker])

  // Latest auto-preview action, read by the open effect without making it depend
  // on the context props/handler (which are fresh each render).
  const autoPreviewRef = useRef<() => void>(() => {})
  autoPreviewRef.current = () => {
    if (initialTrigger && entityId != null && clientRecordId != null) {
      void handlePreview(clientRecordId)
    }
  }

  // Auto-preview when context is fully known on open. Fires on the open transition
  // only; the action itself is read from the ref so deps stay honest at [open].
  useEffect(() => {
    if (open) autoPreviewRef.current()
  }, [open])

  const handleSend = async () => {
    let valid = true
    const trimmedSubject = subject.trim()
    const trimmedBody = body.trim()

    if (!trimmedSubject) {
      setSubjectError('נדרש נושא ההודעה')
      valid = false
    } else {
      setSubjectError(undefined)
    }
    if (!trimmedBody) {
      setBodyError('נדרש תוכן ההודעה')
      valid = false
    } else {
      setBodyError(undefined)
    }
    if (!valid || resolvedClientRecordId == null) return

    await sendAsync({
      payload: {
        client_record_id: resolvedClientRecordId,
        trigger,
        entity_id: entityId,
        channel: 'email',
        overrides: {
          subject: trimmedSubject,
          body: trimmedBody,
        },
        confirm_recent_duplicate: warnings.length > 0,
      },
      idempotencyKey: crypto.randomUUID(),
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      title="שליחת הודעה"
      onClose={onClose}
      footer={
        <div className="flex gap-2 justify-end">
          {step === 'preview' && (
            <Button type="button" variant="ghost" disabled={isSending} onClick={() => setStep('compose')}>
              חזרה
            </Button>
          )}
          <Button type="button" variant="ghost" disabled={isPreviewing || isSending} onClick={onClose}>
            ביטול
          </Button>
          {step === 'compose' ? (
            <Button
              type="button"
              isLoading={isPreviewing}
              disabled={isPreviewing || !!blockedReason}
              onClick={() => void handlePreview()}
            >
              תצוגה מקדימה
            </Button>
          ) : (
            <Button type="button" isLoading={isSending} disabled={isSending} onClick={() => void handleSend()}>
              שלח
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
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

        {step === 'compose' && (
          <>
            <Select
              label="סוג הודעה"
              options={triggerOptions}
              value={trigger}
              onChange={(event) => handleTriggerChange(event.target.value)}
              disabled={disableTriggerChange}
            />
            {blockedReason && <p className="text-sm text-red-600 font-medium">{blockedReason}</p>}
          </>
        )}

        {step === 'preview' && (
          <>
            {warnings.length > 0 && <Alert variant="warning" size="sm" message={warnings.join(' · ')} />}
            <Input label="נושא" value={subject} onChange={(e) => setSubject(e.target.value)} error={subjectError} />
            <Textarea
              label="תוכן ההודעה"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              error={bodyError}
            />
          </>
        )}
      </div>
    </Modal>
  )
}

SendNotificationModal.displayName = 'SendNotificationModal'
