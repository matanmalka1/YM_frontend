import { z } from 'zod'
import type { CreateVatInvoicePayload, UpdateVatInvoicePayload } from '../api'
import {
  VAT_RATE_TYPES,
  DOCUMENT_TYPES,
  COUNTERPARTY_ID_TYPES,
  INVOICE_TYPES,
  type CounterpartyIdType,
} from '../constants/vatConstants'
import { VAT_ERROR_MESSAGES } from '../errorMessages'

const grossAmountSchema = z
  .string()
  .trim()
  .min(1, VAT_ERROR_MESSAGES.validation.grossAmountRequired)
  .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
    message: VAT_ERROR_MESSAGES.validation.grossAmountPositive,
  })

const invoiceCommonFields = {
  gross_amount: grossAmountSchema,
  expense_category: z.string().optional(),
  rate_type: z.enum(VAT_RATE_TYPES).optional(),
  document_type: z.enum(DOCUMENT_TYPES).optional(),
  invoice_number: z.string().trim().optional(),
  invoice_date: z.string().optional(),
  counterparty_name: z.string().trim().optional(),
  counterparty_id: z.string().trim().optional(),
  counterparty_id_type: z.enum(COUNTERPARTY_ID_TYPES).optional(),
}

export type { CounterpartyIdType }

export const isCounterpartyIdType = (value: string | null | undefined): value is CounterpartyIdType =>
  COUNTERPARTY_ID_TYPES.includes(value as CounterpartyIdType)

export const vatInvoiceRowSchema = z
  .object({
    invoice_type: z.enum(INVOICE_TYPES),
    ...invoiceCommonFields,
  })
  .superRefine((data, ctx) => {
    if (data.invoice_type === 'expense' && data.document_type === 'tax_invoice' && !data.counterparty_id) {
      ctx.addIssue({
        code: 'custom',
        message: VAT_ERROR_MESSAGES.validation.counterpartyIdRequired,
        path: ['counterparty_id'],
      })
    }
  })

export type VatInvoiceRowValues = z.infer<typeof vatInvoiceRowSchema>

export const vatInvoiceEditSchema = z.object(invoiceCommonFields)

export type VatInvoiceEditValues = z.infer<typeof vatInvoiceEditSchema>

const inferCounterpartyIdType = (counterpartyId?: string): 'il_business' | undefined => {
  return counterpartyId ? 'il_business' : undefined
}

const buildInvoicePayloadBase = (values: VatInvoiceEditValues) => ({
  gross_amount: values.gross_amount,
  expense_category: values.expense_category || null,
  rate_type: values.rate_type || undefined,
  document_type: values.document_type || null,
  invoice_number: values.invoice_number || undefined,
  invoice_date: values.invoice_date || undefined,
  counterparty_name: values.counterparty_name || undefined,
  counterparty_id: values.counterparty_id || undefined,
  counterparty_id_type: values.counterparty_id_type || inferCounterpartyIdType(values.counterparty_id),
})

export const toInvoiceEditPayload = (values: VatInvoiceEditValues): UpdateVatInvoicePayload => buildInvoicePayloadBase(values)

export const toInvoiceRowPayload = (values: VatInvoiceRowValues): CreateVatInvoicePayload => ({
  invoice_type: values.invoice_type,
  ...buildInvoicePayloadBase(values),
})
