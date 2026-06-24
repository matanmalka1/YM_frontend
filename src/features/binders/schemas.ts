import { z } from 'zod'
import { format } from 'date-fns'
import { ANNUAL_BINDER_TYPES, BINDER_TYPE_VALUES, PERIODIC_BINDER_TYPES } from './constants'
import { BINDERS_ERROR_MESSAGES } from './errorMessages'

export const receiveBinderSchema = z
  .object({
    client_record_id: z
      .number({ error: BINDERS_ERROR_MESSAGES.validation.clientRequired })
      .positive(BINDERS_ERROR_MESSAGES.validation.clientRequired),
    business_id: z
      .number({ error: BINDERS_ERROR_MESSAGES.validation.businessRequired })
      .positive(BINDERS_ERROR_MESSAGES.validation.businessRequired)
      .nullable()
      .optional(),
    binder_types: z.array(z.enum(BINDER_TYPE_VALUES)).min(1, BINDERS_ERROR_MESSAGES.validation.materialTypeRequired),
    annual_report_id: z.number().positive(BINDERS_ERROR_MESSAGES.validation.annualReportRequired).nullable().optional(),
    period_year: z
      .number({ error: BINDERS_ERROR_MESSAGES.validation.reportingYearRequired })
      .int(BINDERS_ERROR_MESSAGES.validation.reportingYearRequired)
      .min(2000, BINDERS_ERROR_MESSAGES.validation.reportingYearRequired),
    period_month_start: z.number().int().min(1).max(12).nullable().optional(),
    period_month_end: z.number().int().min(1).max(12).nullable().optional(),
    salary_month: z.number().int().min(1).max(12).nullable().optional(),
    received_at: z
      .string()
      .min(1, BINDERS_ERROR_MESSAGES.validation.receivedAtRequired)
      .refine((value) => value <= format(new Date(), 'yyyy-MM-dd'), BINDERS_ERROR_MESSAGES.validation.futureDateNotAllowed),
    open_new_binder: z.boolean().optional(),
    notes: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const selectedTypes = new Set(data.binder_types)

    if (selectedTypes.has('vat') && data.business_id === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: BINDERS_ERROR_MESSAGES.validation.businessRequired,
        path: ['business_id'],
      })
    }

    if (!data.period_year) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: BINDERS_ERROR_MESSAGES.validation.reportingYearRequired,
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
        message: BINDERS_ERROR_MESSAGES.validation.reportingMonthRequired,
        path: ['period_month_start'],
      })
    }

    if (selectedTypes.has('salary') && selectedTypes.has('vat') && data.salary_month == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: BINDERS_ERROR_MESSAGES.validation.salaryMonthRequired,
        path: ['salary_month'],
      })
    }
  })

export type ReceiveBinderFormValues = z.infer<typeof receiveBinderSchema>
