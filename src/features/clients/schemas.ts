import { z } from 'zod'
import { validateIsraeliIdentifierChecksum } from '../../utils/validation'
import {
  ADVANCE_PAYMENT_FREQUENCY_VALUES,
  CREATE_CLIENT_VALIDATION_MESSAGES,
  CREATE_ENTITY_TYPES,
  CLIENT_STATUSES,
  ENTITY_TYPES,
  VAT_TYPES,
} from './constants'

export const createBusinessSchema = z.object({
  business_name: z.string().trim().min(1, 'יש להזין שם עסק').max(100, 'שם עסק ארוך מדי'),
  opened_at: z.string().optional().nullable(),
})

export type CreateBusinessFormValues = z.infer<typeof createBusinessSchema>

export const createClientSchema = z
  .object({
    full_name: z.string().trim().min(2, 'שם מלא חייב להכיל לפחות 2 תווים').max(100, 'שם מלא ארוך מדי'),
    id_number: z.string().trim().min(1, 'יש להזין מספר מזהה'),
    entity_type: z.enum(CREATE_ENTITY_TYPES, { message: 'יש לבחור סוג ישות' }),
    phone: z
      .string()
      .trim()
      .min(1, 'יש להזין מספר טלפון')
      .regex(/^0\d{1,2}-?\d{7}$/, 'מספר טלפון לא תקין'),
    email: z.string().trim().min(1, 'יש להזין כתובת אימייל').email('כתובת אימייל לא תקינה'),
    address_street: z.string().trim().min(1, 'יש להזין רחוב'),
    address_building_number: z.string().trim().min(1, 'יש להזין מספר בניין'),
    address_apartment: z.string().trim().optional().or(z.literal('')),
    address_city: z.string().trim().min(1, 'יש להזין עיר'),
    address_zip_code: z.string().trim().optional().or(z.literal('')),
    vat_reporting_frequency: z.enum(VAT_TYPES, { message: 'יש לציין תדירות דיווח מע"מ' }).optional().nullable(),
    advance_payment_frequency: z
      .enum(ADVANCE_PAYMENT_FREQUENCY_VALUES, { message: 'יש לציין תדירות מקדמות' })
      .nullable()
      .optional(),
    advance_rate: z
      .string()
      .trim()
      .optional()
      .nullable()
      .refine(
        (v) => {
          if (!v) return true
          const n = parseFloat(v)
          return !isNaN(n) && n >= 0 && n <= 100
        },
        { message: 'שיעור מקדמות חייב להיות בין 0 ל-100' },
      ),
    accountant_id: z.string().trim().optional().or(z.literal('')),
    business_name: z.string().trim().max(100, 'שם עסק ארוך מדי').optional().or(z.literal('')),
    business_opened_at: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const isCompany = data.entity_type === 'company_ltd'
    const isExempt = data.entity_type === 'osek_patur'
    const trimmedId = data.id_number.trim()

    if (data.advance_payment_frequency == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['advance_payment_frequency'],
        message: 'יש לציין תדירות מקדמות',
      })
    }

    if (isExempt && data.vat_reporting_frequency != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['vat_reporting_frequency'],
        message: CREATE_CLIENT_VALIDATION_MESSAGES.paturVatFrequencyForbidden,
      })
    } else if (!isExempt && data.vat_reporting_frequency == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['vat_reporting_frequency'],
        message: CREATE_CLIENT_VALIDATION_MESSAGES.vatFrequencyRequired,
      })
    }

    if (!/^\d+$/.test(trimmedId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['id_number'],
        message: isCompany
          ? CREATE_CLIENT_VALIDATION_MESSAGES.idDigitsCompany
          : CREATE_CLIENT_VALIDATION_MESSAGES.idDigitsIndividual,
      })
      return
    }

    if (trimmedId.length !== 9) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['id_number'],
        message: isCompany
          ? CREATE_CLIENT_VALIDATION_MESSAGES.idLengthCompany
          : CREATE_CLIENT_VALIDATION_MESSAGES.idLengthIndividual,
      })
      return
    }

    if (!validateIsraeliIdentifierChecksum(trimmedId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['id_number'],
        message: isCompany
          ? CREATE_CLIENT_VALIDATION_MESSAGES.idChecksumCompany
          : CREATE_CLIENT_VALIDATION_MESSAGES.idChecksumIndividual,
      })
    }

    const street = data.address_street?.trim() ?? ''
    if (/\s+\d+$/.test(street)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['address_street'],
        message: CREATE_CLIENT_VALIDATION_MESSAGES.streetContainsNumber,
      })
    }
  })

export const clientEditSchema = z.object({
  full_name: z.string().trim().min(1, 'יש להזין שם מלא'),
  status: z.enum(CLIENT_STATUSES),
  phone: z.string().trim().optional().or(z.literal('')),
  email: z.string().trim().email('כתובת אימייל לא תקינה').optional().or(z.literal('')),
  // Structured address fields
  address_street: z.string().trim().optional().or(z.literal('')),
  address_building_number: z.string().trim().optional().or(z.literal('')),
  address_apartment: z.string().trim().optional().or(z.literal('')),
  address_city: z.string().trim().optional().or(z.literal('')),
  address_zip_code: z.string().trim().optional().or(z.literal('')),
  entity_type: z.enum(ENTITY_TYPES).nullable().optional(),
  vat_reporting_frequency: z.enum(VAT_TYPES).nullable().optional(),
  advance_payment_frequency: z.enum(ADVANCE_PAYMENT_FREQUENCY_VALUES).nullable().optional(),
  advance_rate: z.string().optional().nullable(),
  annual_revenue: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (v) => {
        if (!v) return true
        const n = parseFloat(v)
        return !isNaN(n) && n >= 0
      },
      { message: 'מחזור שנתי חייב להיות מספר חיובי' },
    ),
  accountant_id: z.string().trim().optional().nullable(),
})

export type CreateClientFormValues = z.infer<typeof createClientSchema>
export type ClientEditFormValues = z.infer<typeof clientEditSchema>
