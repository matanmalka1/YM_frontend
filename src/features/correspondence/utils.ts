import { format } from 'date-fns'
import type { CorrespondenceEntry, CreateCorrespondencePayload, UpdateCorrespondencePayload } from './api'
import type { CorrespondenceFormValues } from './schemas'

type ContactOption = { id: number }

export const getCorrespondenceDefaults = (contacts: ContactOption[] = []): CorrespondenceFormValues => ({
  correspondence_type: 'call',
  subject: '',
  notes: '',
  occurred_at: format(new Date(), 'yyyy-MM-dd'),
  contact_id: contacts.length === 1 ? contacts[0].id : null,
})

export const getCorrespondenceFormValues = (entry: CorrespondenceEntry): CorrespondenceFormValues => ({
  correspondence_type: entry.correspondence_type,
  subject: entry.subject,
  notes: entry.notes ?? '',
  occurred_at: format(new Date(entry.occurred_at), 'yyyy-MM-dd'),
  contact_id: entry.contact_id ?? null,
})

export const toCreateCorrespondencePayload = (values: CorrespondenceFormValues): CreateCorrespondencePayload => ({
  ...toUpdateCorrespondencePayload(values),
  business_id: null,
  correspondence_type: values.correspondence_type,
  subject: values.subject,
  occurred_at: values.occurred_at,
})

export const toUpdateCorrespondencePayload = (values: CorrespondenceFormValues): UpdateCorrespondencePayload => ({
  ...values,
  notes: values.notes || null,
  contact_id: values.contact_id ?? null,
})
