import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../../../components/ui/overlays/Modal'
import { Button } from '../../../components/ui/primitives/Button'
import { Input } from '../../../components/ui/inputs/Input'
import { Select } from '../../../components/ui/inputs/Select'
import { DatePicker } from '../../../components/ui/inputs/DatePicker'
import { Textarea } from '../../../components/ui/inputs/Textarea'
import { correspondenceSchema, type CorrespondenceFormValues } from '../schemas'
import type { CorrespondenceEntry } from '../api'
import type { AuthorityContactResponse } from '@/features/authorityContacts'
import { CORRESPONDENCE_TYPE_OPTIONS } from '../constants'
import { getCorrespondenceDefaults, getCorrespondenceFormValues } from '../utils'
import { CORRESPONDENCE_MESSAGES } from '../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface CorrespondenceModalProps {
  open: boolean
  isCreating: boolean
  onClose: () => void
  onSubmit: (values: CorrespondenceFormValues) => Promise<void>
  existing?: CorrespondenceEntry | null
  contacts?: AuthorityContactResponse[]
}

const EMPTY_CONTACTS: AuthorityContactResponse[] = []

export const CorrespondenceModal: React.FC<CorrespondenceModalProps> = ({
  open,
  isCreating,
  onClose,
  onSubmit,
  existing,
  contacts = EMPTY_CONTACTS,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CorrespondenceFormValues>({
    resolver: zodResolver(correspondenceSchema),
    defaultValues: getCorrespondenceDefaults(),
  })

  useEffect(() => {
    if (open) {
      reset(existing ? getCorrespondenceFormValues(existing) : getCorrespondenceDefaults(contacts))
    }
  }, [open, existing, contacts, reset])

  const handleClose = () => {
    reset(getCorrespondenceDefaults())
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    await onSubmit(values)
    reset(getCorrespondenceDefaults())
  })

  const title = existing ? CORRESPONDENCE_MESSAGES.modal.editTitle : CORRESPONDENCE_MESSAGES.modal.addTitle

  return (
    <Modal
      open={open}
      title={title}
      onClose={handleClose}
      footer={
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" disabled={isCreating} onClick={handleClose}>
            {GLOBAL_UI_MESSAGES.actions.cancel}
          </Button>
          <Button type="button" isLoading={isCreating} disabled={isCreating} onClick={submit}>
            {existing ? CORRESPONDENCE_MESSAGES.modal.updateButton : GLOBAL_UI_MESSAGES.actions.add}
          </Button>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Select
          label={CORRESPONDENCE_MESSAGES.modal.typeLabel}
          error={errors.correspondence_type?.message}
          options={CORRESPONDENCE_TYPE_OPTIONS}
          {...register('correspondence_type')}
        />

        <Input label={CORRESPONDENCE_MESSAGES.modal.subjectLabel} error={errors.subject?.message} {...register('subject')} />

        <Controller
          name="occurred_at"
          control={control}
          render={({ field }) => (
            <DatePicker
              label={CORRESPONDENCE_MESSAGES.modal.dateLabel}
              error={errors.occurred_at?.message}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

        {contacts.length > 0 && (
          <Controller
            name="contact_id"
            control={control}
            render={({ field }) => (
              <Select
                label={CORRESPONDENCE_MESSAGES.modal.contactLabel}
                value={field.value ?? ''}
                onChange={(e) => {
                  const val = e.target.value
                  field.onChange(val === '' ? null : Number(val))
                }}
                options={[
                  { value: '', label: CORRESPONDENCE_MESSAGES.modal.noContactOption },
                  ...contacts.map((c) => ({
                    value: String(c.id),
                    label: `${c.name}${c.office ? ` — ${c.office}` : ''}`,
                  })),
                ]}
              />
            )}
          />
        )}

        <Textarea
          label={GLOBAL_UI_MESSAGES.common.notes}
          rows={3}
          placeholder={CORRESPONDENCE_MESSAGES.modal.notesPlaceholder}
          {...register('notes')}
        />
      </form>
    </Modal>
  )
}

CorrespondenceModal.displayName = 'CorrespondenceModal'
