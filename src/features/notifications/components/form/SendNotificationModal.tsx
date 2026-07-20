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
import { NOTIFICATIONS_MESSAGES } from '../../messages'
import { NOTIFICATIONS_ERROR_MESSAGES } from '../../errorMessages'
import { NOTIFICATION_TRIGGER_DOMAIN_LABELS } from '../../constants'
import { GLOBAL_UI_MESSAGES } from '@/messages'

const buildTriggerOptions = (triggers: readonly NotificationTrigger[]) =>
  triggers.map((trigger) => ({
    value: trigger,
    label: NOTIFICATIONS_MESSAGES.form.triggerOptionLabel(
      NOTIFICATION_TRIGGER_DOMAIN_LABELS[trigger] ?? NOTIFICATIONS_MESSAGES.form.generalDomain,
      TRIGGER_LABELS[trigger],
    ),
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
      setClientError(NOTIFICATIONS_ERROR_MESSAGES.form.clientRequired)
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
      setBlockedReason(result.reason ?? NOTIFICATIONS_ERROR_MESSAGES.form.blockedFallback)
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
      setSubjectError(NOTIFICATIONS_ERROR_MESSAGES.form.subjectRequired)
      valid = false
    } else {
      setSubjectError(undefined)
    }
    if (!trimmedBody) {
      setBodyError(NOTIFICATIONS_ERROR_MESSAGES.form.bodyRequired)
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
      title={NOTIFICATIONS_MESSAGES.form.title}
      onClose={onClose}
      footer={
        <div className="flex gap-2 justify-end">
          {step === 'preview' && (
            <Button type="button" variant="ghost" disabled={isSending} onClick={() => setStep('compose')}>
              {GLOBAL_UI_MESSAGES.actions.back}
            </Button>
          )}
          <Button type="button" variant="ghost" disabled={isPreviewing || isSending} onClick={onClose}>
            {GLOBAL_UI_MESSAGES.actions.cancel}
          </Button>
          {step === 'compose' ? (
            <Button
              type="button"
              isLoading={isPreviewing}
              disabled={isPreviewing || !!blockedReason}
              onClick={() => void handlePreview()}
            >
              {GLOBAL_UI_MESSAGES.actions.preview}
            </Button>
          ) : (
            <Button type="button" isLoading={isSending} disabled={isSending} onClick={() => void handleSend()}>
              {GLOBAL_UI_MESSAGES.actions.send}
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
              label={NOTIFICATIONS_MESSAGES.form.typeLabel}
              options={triggerOptions}
              value={trigger}
              onChange={(event) => handleTriggerChange(event.target.value)}
              disabled={disableTriggerChange}
            />
            {blockedReason && <p className="text-sm text-negative-600 font-medium">{blockedReason}</p>}
          </>
        )}

        {step === 'preview' && (
          <>
            {warnings.length > 0 && <Alert variant="warning" size="sm" message={warnings.join(' · ')} />}
            <Input
              label={NOTIFICATIONS_MESSAGES.form.subjectLabel}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              error={subjectError}
            />
            <Textarea
              label={NOTIFICATIONS_MESSAGES.form.bodyLabel}
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
