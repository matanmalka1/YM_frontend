import { z } from 'zod'
import type { ReminderType } from './api'

const DEFAULT_REMINDER_DAYS_BEFORE = 7

// Reusable: numeric string that must parse to a positive integer
const positiveIdString = (fieldLabel: string) =>
  z
    .string()
    .min(1, `נא להזין ${fieldLabel}`)
    .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, `נא להזין ${fieldLabel} תקין`)

const baseFields = {
  // client_record_id — always required. Fixed on client pages, selected via picker on global pages.
  client_record_id: positiveIdString('מזהה רשומת לקוח'),
  // business_id — required for business-scoped types; derived from the linked entity where possible.
  business_id: z.string().optional(),
  target_date: z.string().min(1, 'נא לבחור תאריך יעד'),
  days_before: z
    .number({ error: 'נא להזין מספר ימים' })
    .int('נא להזין מספר שלם')
    .min(0, 'מספר ימים לפני חייב להיות אפס או יותר'),
}

// FK id fields that are irrelevant for a given type are present but optional/empty
const optionalFkFields = {
  binder_id: z.string().optional(),
}

const buildLinkedReminderSchema = <
  TReminderType extends Exclude<ReminderType, 'document_missing' | 'custom'>,
  TField extends keyof typeof optionalFkFields,
>(
  reminderType: TReminderType,
  requiredField: TField,
  fieldLabel: string,
) =>
  z.object({
    ...baseFields,
    reminder_type: z.literal(reminderType),
    ...optionalFkFields,
    [requiredField]: positiveIdString(fieldLabel),
    message: z.string().optional(),
  })

export const createReminderSchema = z.discriminatedUnion('reminder_type', [
  buildLinkedReminderSchema('binder_idle', 'binder_id', 'מזהה תיק'),
  z.object({
    ...baseFields,
    reminder_type: z.literal('document_missing'),
    message: z.string().optional(),
    ...optionalFkFields,
  }),
  z.object({
    ...baseFields,
    reminder_type: z.literal('custom'),
    message: z.string().min(1, 'נא להזין הודעת תזכורת'),
    ...optionalFkFields,
  }),
])

export type CreateReminderFormValues = z.infer<typeof createReminderSchema>

export const createReminderDefaultValues = {
  reminder_type: 'custom' as const,
  client_record_id: '',
  business_id: '',
  target_date: '',
  days_before: DEFAULT_REMINDER_DAYS_BEFORE,
  message: '',
  binder_id: '',
}
