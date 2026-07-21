import { z } from 'zod'
import type { InvoiceAttachRequest } from './api'
import { INVOICES_ERROR_MESSAGES } from './errorMessages'

export const invoiceAttachSchema = z.object({
  provider: z.string().trim().min(1, INVOICES_ERROR_MESSAGES.validation.providerRequired),
  external_invoice_id: z.string().trim().min(1, INVOICES_ERROR_MESSAGES.validation.invoiceIdRequired),
  issued_at: z
    .string()
    .trim()
    .min(1, INVOICES_ERROR_MESSAGES.validation.issuedAtRequired)
    .refine((value) => Number.isFinite(new Date(value).getTime()), {
      message: INVOICES_ERROR_MESSAGES.validation.validIssuedAt,
    }),
  document_url: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^https?:\/\/\S+$/i.test(value), {
      message: INVOICES_ERROR_MESSAGES.validation.validUrl,
    }),
})

export type InvoiceAttachFormValues = z.infer<typeof invoiceAttachSchema>

const pad = (value: number): string => String(value).padStart(2, '0')

export const getInvoiceAttachDefaultValues = (): InvoiceAttachFormValues => {
  const now = new Date()
  return {
    provider: '',
    external_invoice_id: '',
    issued_at: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`,
    document_url: '',
  }
}

export const toInvoiceAttachPayload = (chargeId: number, values: InvoiceAttachFormValues): InvoiceAttachRequest => ({
  charge_id: chargeId,
  provider: values.provider.trim(),
  external_invoice_id: values.external_invoice_id.trim(),
  issued_at: new Date(values.issued_at).toISOString(),
  document_url: values.document_url?.trim() || null,
})
