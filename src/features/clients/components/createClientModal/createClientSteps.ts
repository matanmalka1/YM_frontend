import type { CreateClientFormValues } from '../../schemas'

export const CREATE_CLIENT_STEPS = [
  { key: 'identity', label: 'זיהוי', fields: ['entity_type', 'full_name', 'id_number'] },
  {
    key: 'business',
    label: 'עסק ופרטי קשר',
    fields: [
      'business_name',
      'business_opened_at',
      'phone',
      'email',
      'address_street',
      'address_building_number',
      'address_apartment',
      'address_zip_code',
      'address_city',
    ],
  },
  {
    key: 'tax',
    label: 'מס ומע״מ',
    fields: ['vat_reporting_frequency', 'advance_payment_frequency', 'advance_rate', 'accountant_id'],
  },
  {
    key: 'review',
    label: 'סקירה',
    fields: [],
  },
] as const satisfies ReadonlyArray<{
  key: string
  label: string
  fields: ReadonlyArray<keyof CreateClientFormValues>
}>
