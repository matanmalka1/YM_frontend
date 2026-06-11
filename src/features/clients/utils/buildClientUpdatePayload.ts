import type { FieldNamesMarkedBoolean } from 'react-hook-form'
import type { UpdateClientPayload } from '../api'
import type { ClientEditFormValues } from '../schemas'

const blankToNull = (value: string | null | undefined): string | null => (value?.trim() ? value.trim() : null)

export const buildClientUpdatePayload = (
  data: ClientEditFormValues,
  dirtyFields: FieldNamesMarkedBoolean<ClientEditFormValues>,
): UpdateClientPayload => {
  const payload: UpdateClientPayload = {}

  if (dirtyFields.full_name) payload.full_name = data.full_name.trim()
  if (dirtyFields.status) payload.status = data.status
  if (dirtyFields.phone) payload.phone = blankToNull(data.phone)
  if (dirtyFields.email) payload.email = blankToNull(data.email)
  if (dirtyFields.address_street) payload.address_street = blankToNull(data.address_street)
  if (dirtyFields.address_building_number) {
    payload.address_building_number = blankToNull(data.address_building_number)
  }
  if (dirtyFields.address_apartment) payload.address_apartment = blankToNull(data.address_apartment)
  if (dirtyFields.address_city) payload.address_city = blankToNull(data.address_city)
  if (dirtyFields.address_zip_code) payload.address_zip_code = blankToNull(data.address_zip_code)
  if (dirtyFields.entity_type) payload.entity_type = data.entity_type || null
  if (dirtyFields.vat_reporting_frequency || dirtyFields.entity_type) {
    payload.vat_reporting_frequency = data.entity_type === 'osek_patur' ? null : data.vat_reporting_frequency || null
  }
  if (dirtyFields.advance_payment_frequency) {
    payload.advance_payment_frequency = data.advance_payment_frequency || null
  }
  if (dirtyFields.advance_rate) {
    payload.advance_rate = blankToNull(data.advance_rate)
    // advance_rate_updated_at is server-owned; the backend stamps it on change.
  }
  if (dirtyFields.annual_revenue) {
    payload.annual_revenue = blankToNull(data.annual_revenue)
  }
  if (dirtyFields.accountant_id) {
    payload.accountant_id = data.accountant_id ? Number(data.accountant_id) : null
  }

  return payload
}

export const hasClientUpdatePayload = (payload: UpdateClientPayload): boolean => Object.keys(payload).length > 0
