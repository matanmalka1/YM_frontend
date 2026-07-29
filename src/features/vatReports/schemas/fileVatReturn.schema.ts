import { z } from 'zod'
import type { FileVatReturnPayload } from '../api'
import { DEFAULT_VAT_FILING_METHOD, VAT_FILING_METHODS } from '../constants/vatConstants'

export const vatFileModalSchema = z.object({
  submission_method: z.enum(VAT_FILING_METHODS),
  submission_reference: z.string().trim().optional(),
})

export type VatFileModalFormValues = z.infer<typeof vatFileModalSchema>

export const vatFileModalDefaultValues: VatFileModalFormValues = {
  submission_method: DEFAULT_VAT_FILING_METHOD,
  submission_reference: '',
}

export const toFileVatReturnPayload = (values: VatFileModalFormValues): FileVatReturnPayload => ({
  submission_method: values.submission_method,
  submission_reference: values.submission_reference?.trim() || undefined,
})
