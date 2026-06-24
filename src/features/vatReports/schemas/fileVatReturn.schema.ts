import { z } from 'zod'
import type { FileVatReturnPayload } from '../api'
import { DEFAULT_VAT_FILING_METHOD, VAT_FILING_METHODS } from '../constants/vatConstants'
import { VAT_ERROR_MESSAGES } from '../errorMessages'

export const vatFileModalSchema = z
  .object({
    submission_method: z.enum(VAT_FILING_METHODS),
    submission_reference: z.string().trim().optional(),
    is_amendment: z.boolean(),
    amends_item_id: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    if (!values.is_amendment) return

    if (!values.amends_item_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['amends_item_id'],
        message: VAT_ERROR_MESSAGES.validation.originalSubmissionRequired,
      })
      return
    }

    const parsed = Number(values.amends_item_id)
    if (!Number.isInteger(parsed) || parsed <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['amends_item_id'],
        message: VAT_ERROR_MESSAGES.validation.originalSubmissionNumeric,
      })
    }
  })

export type VatFileModalFormValues = z.infer<typeof vatFileModalSchema>

export const vatFileModalDefaultValues: VatFileModalFormValues = {
  submission_method: DEFAULT_VAT_FILING_METHOD,
  submission_reference: '',
  is_amendment: false,
  amends_item_id: '',
}

export const toFileVatReturnPayload = (values: VatFileModalFormValues): FileVatReturnPayload => ({
  submission_method: values.submission_method,
  submission_reference: values.submission_reference?.trim() || undefined,
  is_amendment: values.is_amendment,
  amends_item_id: values.is_amendment ? Number(values.amends_item_id?.trim()) : null,
})
