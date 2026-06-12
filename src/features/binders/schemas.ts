import { z } from 'zod'
import { format } from 'date-fns'
import { ANNUAL_BINDER_TYPES, BINDER_TYPE_VALUES, PERIODIC_BINDER_TYPES } from './constants'

export const receiveBinderSchema = z
  .object({
    client_record_id: z.number({ error: 'נא לבחור לקוח' }).positive('נא לבחור לקוח'),
    business_id: z.number({ error: 'נא לבחור עסק' }).positive('נא לבחור עסק').nullable().optional(),
    binder_types: z.array(z.enum(BINDER_TYPE_VALUES)).min(1, 'נא לבחור לפחות סוג חומר אחד'),
    annual_report_id: z.number().positive('נא לבחור דוח שנתי').nullable().optional(),
    period_year: z.number({ error: 'נא לבחור שנת דיווח' }).int('נא לבחור שנת דיווח').min(2000, 'נא לבחור שנת דיווח'),
    period_month_start: z.number().int().min(1).max(12).nullable().optional(),
    period_month_end: z.number().int().min(1).max(12).nullable().optional(),
    salary_month: z.number().int().min(1).max(12).nullable().optional(),
    received_at: z
      .string()
      .min(1, 'נא לבחור תאריך קבלה')
      .refine((value) => value <= format(new Date(), 'yyyy-MM-dd'), 'לא ניתן לבחור תאריך עתידי'),
    open_new_binder: z.boolean().optional(),
    notes: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const selectedTypes = new Set(data.binder_types)

    if (selectedTypes.has('vat') && data.business_id === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'נא לבחור עסק',
        path: ['business_id'],
      })
    }

    if (!data.period_year) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'נא לבחור שנת דיווח',
        path: ['period_year'],
      })
    }

    const hasPeriodicMaterial = data.binder_types.some((type) => PERIODIC_BINDER_TYPES.has(type))
    const hasOnlyAnnualMaterials = data.binder_types.every((type) => ANNUAL_BINDER_TYPES.has(type))

    if (hasOnlyAnnualMaterials || !hasPeriodicMaterial) {
      return
    }

    if (data.period_month_start == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'נא לבחור חודש דיווח',
        path: ['period_month_start'],
      })
    }

    if (selectedTypes.has('salary') && selectedTypes.has('vat') && data.salary_month == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'נא לבחור חודש שכר',
        path: ['salary_month'],
      })
    }
  })

export type ReceiveBinderFormValues = z.infer<typeof receiveBinderSchema>
