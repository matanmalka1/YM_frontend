import { z } from 'zod'
import { PERIOD_PATTERN } from '@/constants/periodOptions.constants'
import type { CreateVatWorkItemPayload } from '../api'

export const vatWorkItemCreateSchema = z.object({
  client_id: z
    .string()
    .trim()
    .min(1, 'יש לבחור לקוח')
    .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, {
      message: 'יש לבחור לקוח תקין',
    }),
  period: z
    .string()
    .trim()
    .min(1, 'יש להזין תקופה')
    .refine((v) => PERIOD_PATTERN.test(v), {
      message: 'פורמט תקופה חייב להיות YYYY-MM',
    }),
  mark_pending: z.boolean(),
  pending_materials_note: z.string().trim().optional(),
})

export type VatWorkItemCreateFormValues = z.infer<typeof vatWorkItemCreateSchema>

export const vatWorkItemCreateDefaultValues: VatWorkItemCreateFormValues = {
  client_id: '',
  period: '',
  mark_pending: false,
  pending_materials_note: '',
}

export const toCreateVatWorkItemPayload = (values: VatWorkItemCreateFormValues): CreateVatWorkItemPayload => ({
  client_record_id: Number(values.client_id),
  period: values.period.trim(),
  mark_pending: values.mark_pending,
  pending_materials_note: values.pending_materials_note?.trim() || null,
})
