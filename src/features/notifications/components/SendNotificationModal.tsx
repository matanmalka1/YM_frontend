import { useEffect, useState } from 'react'
import { Modal } from '../../../components/ui/overlays/Modal'
import { Button } from '../../../components/ui/primitives/Button'
import { Select } from '../../../components/ui/inputs/Select'
import { Input } from '../../../components/ui/inputs/Input'
import { Textarea } from '../../../components/ui/inputs/Textarea'
import { ClientPickerField, useClientPickerState } from '../../../components/shared/client'
import { usePreviewNotification, useSendNotification } from '../hooks/useSendNotification'
import { PHASE1_TRIGGERS, TRIGGER_LABELS } from '../api'
import type { NotificationTrigger } from '../api'

const TRIGGER_OPTIONS = PHASE1_TRIGGERS.map((t) => ({ value: t, label: TRIGGER_LABELS[t] }))

export interface SendNotificationModalProps {
  open: boolean
  onClose: () => void
  clientRecordId?: number
}

type Step = 'compose' | 'preview'

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({ open, onClose, clientRecordId }) => {
  const { previewAsync, isPreviewing } = usePreviewNotification()
  const { sendAsync, isSending } = useSendNotification()

  const [step, setStep] = useState<Step>('compose')
  const [trigger, setTrigger] = useState<NotificationTrigger>(PHASE1_TRIGGERS[0])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [subjectError, setSubjectError] = useState<string | undefined>()
  const [bodyError, setBodyError] = useState<string | undefined>()
  const [clientError, setClientError] = useState<string | undefined>()
  const [blockedReason, setBlockedReason] = useState<string | undefined>()
  const [warnings, setWarnings] = useState<string[]>([])

  const { clientQuery, selectedClient, handleSelectClient, handleClearClient, handleClientQueryChange, resetClientPicker } =
    useClientPickerState()

  const resolvedClientRecordId = clientRecordId ?? selectedClient?.id

  useEffect(() => {
    if (open) {
      setStep('compose')
      setTrigger(PHASE1_TRIGGERS[0])
      setSubject('')
      setBody('')
      setSubjectError(undefined)
      setBodyError(undefined)
      setClientError(undefined)
      setBlockedReason(undefined)
      setWarnings([])
      resetClientPicker()
    }
  }, [open, resetClientPicker])

  const handlePreview = async () => {
    if (resolvedClientRecordId == null) {
      setClientError('יש לבחור לקוח')
      return
    }
    setClientError(undefined)
    setBlockedReason(undefined)
    setWarnings([])

    const result = await previewAsync({ client_record_id: resolvedClientRecordId, trigger })
    if (result.status === 'blocked') {
      setBlockedReason(result.reason ?? 'שליחת ההודעה חסומה')
      return
    }
    setSubject(result.subject ?? '')
    setBody(result.body ?? '')
    if (result.warnings?.length) setWarnings(result.warnings)
    setStep('preview')
  }

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

    await sendAsync({ client_record_id: resolvedClientRecordId, trigger, subject: trimmedSubject, body: trimmedBody })
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
            <Button type="button" isLoading={isPreviewing} disabled={isPreviewing} onClick={() => void handlePreview()}>
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
      <div className="space-y-4" dir="rtl">
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
              options={TRIGGER_OPTIONS}
              value={trigger}
              onChange={(e) => setTrigger(e.target.value as NotificationTrigger)}
            />
            {blockedReason && (
              <p className="text-sm text-red-600 font-medium">{blockedReason}</p>
            )}
          </>
        )}

        {step === 'preview' && (
          <>
            {warnings.length > 0 && (
              <div className="rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2 space-y-1">
                {warnings.map((w, i) => (
                  <p key={i} className="text-xs text-yellow-800">{w}</p>
                ))}
              </div>
            )}
            <Input
              label="נושא"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              error={subjectError}
              dir="rtl"
            />
            <Textarea
              label="תוכן ההודעה"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              error={bodyError}
              dir="rtl"
            />
          </>
        )}
      </div>
    </Modal>
  )
}

SendNotificationModal.displayName = 'SendNotificationModal'
