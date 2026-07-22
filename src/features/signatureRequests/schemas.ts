import { z } from 'zod'
import type { CreateSignatureRequestPayload } from './api'
import { SIGNATURE_REQUEST_TYPE_VALUES } from './constants'
import { SIGNATURE_REQUESTS_ERROR_MESSAGES } from './errorMessages'

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined)

export const signatureRequestCreateFormSchema = z.object({
  client_record_id: z.number().int().positive(SIGNATURE_REQUESTS_ERROR_MESSAGES.validation.client),
  request_type: z.enum(SIGNATURE_REQUEST_TYPE_VALUES),
  title: z
    .string()
    .trim()
    .min(3, SIGNATURE_REQUESTS_ERROR_MESSAGES.validation.titleMin)
    .max(200, SIGNATURE_REQUESTS_ERROR_MESSAGES.validation.titleMax),
  description: z
    .string()
    .trim()
    .max(2000, SIGNATURE_REQUESTS_ERROR_MESSAGES.validation.descriptionMax)
    .optional()
    .transform((value) => value || undefined),
  signer_name: z
    .string()
    .trim()
    .min(2, SIGNATURE_REQUESTS_ERROR_MESSAGES.validation.signerNameMin)
    .max(100, SIGNATURE_REQUESTS_ERROR_MESSAGES.validation.signerNameMax),
  signer_email: z
    .string()
    .trim()
    .email(SIGNATURE_REQUESTS_ERROR_MESSAGES.validation.email)
    .optional()
    .or(z.literal(''))
    .transform((value) => value || undefined),
  signer_phone: optionalTrimmedString,
})

export type SignatureRequestCreateFormValues = z.input<typeof signatureRequestCreateFormSchema>
type ParsedSignatureRequestCreateFormValues = z.output<typeof signatureRequestCreateFormSchema>

export const toCreateSignatureRequestPayload = (
  values: ParsedSignatureRequestCreateFormValues,
  businessId?: number,
): CreateSignatureRequestPayload => ({
  client_record_id: values.client_record_id,
  business_id: businessId,
  request_type: values.request_type,
  title: values.title,
  description: values.description,
  signer_name: values.signer_name,
  signer_email: values.signer_email,
  signer_phone: values.signer_phone,
})
