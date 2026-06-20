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

  const title = existing ? 'עריכת רשומת התכתבות' : 'הוספת רשומת התכתבות'

  return (
    <Modal
      open={open}
      title={title}
      onClose={handleClose}
      footer={
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" disabled={isCreating} onClick={handleClose}>
            ביטול
          </Button>
          <Button type="button" isLoading={isCreating} disabled={isCreating} onClick={submit}>
            {existing ? 'עדכן' : 'הוסף'}
          </Button>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Select
          label="סוג"
          error={errors.correspondence_type?.message}
          options={CORRESPONDENCE_TYPE_OPTIONS}
          {...register('correspondence_type')}
        />

        <Input label="נושא *" error={errors.subject?.message} {...register('subject')} />

        <Controller
          name="occurred_at"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="תאריך *"
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
                label="איש קשר (רשות)"
                value={field.value ?? ''}
                onChange={(e) => {
                  const val = e.target.value
                  field.onChange(val === '' ? null : Number(val))
                }}
                options={[
                  { value: '', label: 'ללא איש קשר' },
                  ...contacts.map((c) => ({
                    value: String(c.id),
                    label: `${c.name}${c.office ? ` — ${c.office}` : ''}`,
                  })),
                ]}
              />
            )}
          />
        )}

        <Textarea label="הערות" rows={3} placeholder="הוסף הערות..." {...register('notes')} />
      </form>
    </Modal>
  )
}

CorrespondenceModal.displayName = 'CorrespondenceModal'
