import { z } from 'zod'
import type { UploadDocumentPayload } from './api'
import { CLIENT_SCOPE_TYPES, DOCUMENT_TYPES } from './documents.constants'

export interface DocumentsUploadFormValues {
  document_type: UploadDocumentPayload['document_type']
  business_id: number | null
  file: File | null
  tax_year: number | null
  annual_report_id: number | null
}

export const documentsUploadSchema = z
  .object({
    document_type: z.enum(DOCUMENT_TYPES, { message: 'יש לבחור סוג מסמך' }),
    business_id: z.number().nullable(),
    file: z
      .custom<File | null>((value) => value === null || value instanceof File)
      .refine((file) => file !== null && Object.prototype.toString.call(file) === '[object File]', {
        message: 'יש לבחור קובץ לפני העלאה',
      }),
    tax_year: z.number().nullable(),
    annual_report_id: z.number().nullable(),
  })
  .refine((data) => !(CLIENT_SCOPE_TYPES.has(data.document_type) && data.business_id !== null), {
    message: 'סוג מסמך זה שייך ללקוח ולא לעסק ספציפי',
    path: ['business_id'],
  })

export const documentsUploadDefaultValues: DocumentsUploadFormValues = {
  document_type: '' as DocumentsUploadFormValues['document_type'],
  business_id: null,
  file: null,
  tax_year: null,
  annual_report_id: null,
}
