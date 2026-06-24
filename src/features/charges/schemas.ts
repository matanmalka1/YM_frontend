import { z } from 'zod'
import type { CreateChargePayload } from './api'
import { CHARGE_PERIOD_PATTERN, CHARGE_TYPE_VALUES } from './constants'
import { CHARGES_MESSAGES } from './messages'

export const chargeCreateSchema = z.object({
  client_record_id: z
    .string()
    .trim()
    .min(1, CHARGES_MESSAGES.validation.clientRequired)
    .refine((value) => Number.isInteger(Number(value)) && Number(value) > 0, {
      message: CHARGES_MESSAGES.validation.clientIdPositive,
    }),
  amount: z
    .string()
    .trim()
    .min(1, CHARGES_MESSAGES.validation.amountRequired)
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, {
      message: CHARGES_MESSAGES.validation.amountPositive,
    }),
  charge_type: z.enum(CHARGE_TYPE_VALUES),
  months_covered: z.union([z.literal(1), z.literal(2)]),
  period: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || CHARGE_PERIOD_PATTERN.test(value), {
      message: CHARGES_MESSAGES.validation.periodFormat,
    }),
  business_id: z.number().int().positive().optional().nullable(),
})

export type ChargeCreateFormValues = z.infer<typeof chargeCreateSchema>

export const chargeCreateDefaultValues: ChargeCreateFormValues = {
  client_record_id: '',
  amount: '',
  charge_type: 'monthly_retainer',
  months_covered: 1,
  period: '',
  business_id: null,
}

export const toCreateChargePayload = (values: ChargeCreateFormValues): CreateChargePayload => ({
  client_record_id: Number(values.client_record_id),
  amount: values.amount,
  charge_type: values.charge_type,
  months_covered: values.months_covered,
  period: values.period?.trim() ? values.period.trim() : null,
  business_id: values.business_id ?? null,
})
