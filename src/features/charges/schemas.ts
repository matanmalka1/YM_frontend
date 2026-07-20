import { z } from 'zod'
import type { ChargeResponse, CreateChargePayload, UpdateChargePayload } from './api'
import { CHARGE_PERIOD_PATTERN, CHARGE_TYPE_VALUES } from './constants'
import { CHARGES_MESSAGES } from './messages'

// Fields shared by the create and edit forms. Create adds the client picker;
// edit adds description and keeps the client fixed.
const chargeCoreSchema = z.object({
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

export const chargeCreateSchema = chargeCoreSchema.extend({
  client_record_id: z
    .string()
    .trim()
    .min(1, CHARGES_MESSAGES.validation.clientRequired)
    .refine((value) => Number.isInteger(Number(value)) && Number(value) > 0, {
      message: CHARGES_MESSAGES.validation.clientIdPositive,
    }),
})

export const chargeEditSchema = chargeCoreSchema.extend({
  description: z.string().trim().optional(),
})

export type ChargeCreateFormValues = z.infer<typeof chargeCreateSchema>
export type ChargeEditFormValues = z.infer<typeof chargeEditSchema>

export const chargeCreateDefaultValues: ChargeCreateFormValues = {
  client_record_id: '',
  amount: '',
  charge_type: 'monthly_retainer',
  months_covered: 1,
  period: '',
  business_id: null,
}

const toChargeCorePayload = (values: z.infer<typeof chargeCoreSchema>) => ({
  amount: values.amount,
  charge_type: values.charge_type,
  months_covered: values.months_covered,
  period: values.period?.trim() ? values.period.trim() : null,
  business_id: values.business_id ?? null,
})

export const toCreateChargePayload = (values: ChargeCreateFormValues): CreateChargePayload => ({
  client_record_id: Number(values.client_record_id),
  ...toChargeCorePayload(values),
})

export const toUpdateChargePayload = (values: ChargeEditFormValues): UpdateChargePayload => ({
  ...toChargeCorePayload(values),
  description: values.description?.trim() ? values.description.trim() : null,
})

export const toChargeEditDefaultValues = (charge: ChargeResponse): ChargeEditFormValues => ({
  amount: charge.amount,
  charge_type: (charge.charge_type ?? 'monthly_retainer') as ChargeEditFormValues['charge_type'],
  months_covered: charge.months_covered === 2 ? 2 : 1,
  period: charge.period ?? '',
  business_id: charge.business_id ?? null,
  description: charge.description ?? '',
})
