export interface TaxProfileData {
  id: number
  entity_type: string | null
  vat_reporting_frequency: 'monthly' | 'bimonthly' | 'exempt' | null
  vat_exempt_ceiling: string | null
  advance_rate: string | null
  advance_rate_updated_at: string | null
  accountant_id: number | null
  advance_payment_frequency: 'monthly' | 'bimonthly' | null
}

export interface TaxProfileUpdatePayload {
  vat_reporting_frequency?: 'monthly' | 'bimonthly' | 'exempt' | null
  entity_type?: string | null
  accountant_id?: number | null
  advance_rate?: string | null
  // advance_rate_updated_at is server-owned (stamped by the backend on change);
  // it is not part of the update contract.
  vat_exempt_ceiling?: string | null
  advance_payment_frequency?: 'monthly' | 'bimonthly' | null
}
