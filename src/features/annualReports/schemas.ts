import { z } from 'zod'
import {
  CREATE_REPORT_CLIENT_TYPES,
  REPORT_DEADLINE_TYPES,
  REPORT_SUBMISSION_METHODS,
  REPORT_EXTENSION_REASONS,
} from './constants/reportConstants'

// ── Create Report ──────────────────────────────────────────────────────────

export const createReportSchema = z.object({
  client_id: z.string().min(1, 'שדה חובה'),
  tax_year: z.string().min(4, 'שנה לא תקינה'),
  client_type: z.enum(CREATE_REPORT_CLIENT_TYPES),
  deadline_type: z.enum(REPORT_DEADLINE_TYPES).default('standard'),
  submission_method: z.enum(REPORT_SUBMISSION_METHODS).optional(),
  extension_reason: z.enum(REPORT_EXTENSION_REASONS).optional(),
  notes: z.string().optional(),
  has_rental_income: z.boolean().default(false),
  has_capital_gains: z.boolean().default(false),
  has_foreign_income: z.boolean().default(false),
  has_depreciation: z.boolean().default(false),
  // Pre-fill fields — NOT sent to API; used for client-side preview only
  gross_income: z.string().optional(),
  expenses: z.string().optional(),
  advances_paid: z.string().optional(),
  credit_points: z.string().optional(),
})

export type CreateReportFormValues = z.input<typeof createReportSchema>

// ── Report Detail ──────────────────────────────────────────────────────────

export const annualReportDetailSchema = z.object({
  client_approved_at: z.string().trim().optional().or(z.literal('')),
  internal_notes: z.string().trim().optional().or(z.literal('')),
})

export type AnnualReportDetailFormValues = z.infer<typeof annualReportDetailSchema>

export const annualReportDetailDefaults: AnnualReportDetailFormValues = {
  client_approved_at: '',
  internal_notes: '',
}
