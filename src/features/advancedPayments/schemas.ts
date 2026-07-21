import { z } from 'zod'

export const createAdvancePaymentSchema = z.object({
  month: z.number({ error: 'יש לבחור חודש' }).int().min(1, 'חודש חייב להיות בין 1 ל-12').max(12, 'חודש חייב להיות בין 1 ל-12'),
  period_months_count: z.union([z.literal(1), z.literal(2)]),
  turnover_amount: z.number().min(0, 'הסכום חייב להיות חיובי').nullable().optional(),
  advance_rate: z.number().min(0, 'האחוז חייב להיות חיובי').nullable().optional(),
  override_amount: z.number().min(0, 'הסכום חייב להיות חיובי').nullable().optional(),
  paid_amount: z.number().min(0, 'הסכום חייב להיות חיובי').nullable(),
  notes: z.string().nullable().optional(),
})

export type CreateAdvancePaymentFormValues = z.infer<typeof createAdvancePaymentSchema>

export const CREATE_ADVANCE_PAYMENT_DEFAULTS: CreateAdvancePaymentFormValues = {
  month: new Date().getMonth() + 1,
  period_months_count: 1,
  turnover_amount: null,
  advance_rate: null,
  override_amount: null,
  paid_amount: null,
  notes: null,
}
