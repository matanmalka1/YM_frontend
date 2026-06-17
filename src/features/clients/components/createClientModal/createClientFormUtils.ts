import type { CreateClientPayload, ISODateString } from '../../api'
import type { ClientCreationImpactResponse } from '../../api/contracts'
import {
  ADVANCE_PAYMENT_FREQUENCY_LABELS,
  ENTITY_TYPE_LABELS,
  VAT_TYPE_LABELS,
  deriveCreateClientIdNumberType,
} from '../../constants'
import type { CreateClientFormValues } from '../../schemas'

export const stripNonDigits = (e: React.FormEvent<HTMLInputElement>) => {
  const input = e.currentTarget
  const cleaned = input.value.replace(/\D/g, '')
  if (cleaned !== input.value) input.value = cleaned
}

export const stripNonPhone = (e: React.FormEvent<HTMLInputElement>) => {
  const input = e.currentTarget
  const cleaned = input.value.replace(/[^\d-]/g, '')
  if (cleaned !== input.value) input.value = cleaned
}

export const stripNonDecimal = (e: React.FormEvent<HTMLInputElement>) => {
  const input = e.currentTarget
  const cleaned = input.value.replace(/[^\d.]/g, '')
  if (cleaned !== input.value) input.value = cleaned
}

export const buildCreateClientPayload = (data: CreateClientFormValues): CreateClientPayload => {
  const trimmedIdNumber = data.id_number.trim()

  return {
    full_name: data.full_name.trim(),
    id_number: trimmedIdNumber,
    id_number_type: deriveCreateClientIdNumberType(data.entity_type),
    entity_type: data.entity_type,
    phone: data.phone,
    email: data.email,
    address_street: data.address_street,
    address_building_number: data.address_building_number,
    address_apartment: data.address_apartment?.trim() || null,
    address_city: data.address_city,
    address_zip_code: data.address_zip_code?.trim() || null,
    vat_reporting_frequency: data.entity_type === 'osek_patur' ? undefined : data.vat_reporting_frequency,
    advance_payment_frequency: data.advance_payment_frequency ?? null,
    advance_rate: data.advance_rate?.trim() ? data.advance_rate.trim() : null,
    accountant_id: data.accountant_id ? Number(data.accountant_id) : null,
    business_name:
      data.entity_type === 'company_ltd' ? data.full_name.trim() : data.business_name?.trim() || data.full_name.trim(),
    business_opened_at: (data.business_opened_at || null) as ISODateString | null,
  }
}

interface CreateClientReviewModel {
  isCompany: boolean
  isExempt: boolean
  entityLabel: string | null
  vatLabel: string | null
  advanceLabel: string | null
  advisorLabel: string | null
  businessDisplayName: string | null
  addressLine: string | null
  impactTotal: number
}

/** Derives the display values shown on the create-client review step from the raw form values. */
export const buildCreateClientReviewModel = (
  values: CreateClientFormValues,
  advisorOptions: Array<{ value: string; label: string }>,
  impactData?: ClientCreationImpactResponse,
): CreateClientReviewModel => {
  const isCompany = values.entity_type === 'company_ltd'
  const isExempt = values.entity_type === 'osek_patur'

  const addressLine =
    [
      values.address_street,
      values.address_building_number,
      values.address_apartment,
      values.address_city,
      values.address_zip_code,
    ]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(' ') || null

  return {
    isCompany,
    isExempt,
    entityLabel: values.entity_type ? ENTITY_TYPE_LABELS[values.entity_type] : null,
    vatLabel: isExempt
      ? 'פטור'
      : values.vat_reporting_frequency
        ? VAT_TYPE_LABELS[values.vat_reporting_frequency]
        : null,
    advanceLabel: values.advance_payment_frequency
      ? ADVANCE_PAYMENT_FREQUENCY_LABELS[values.advance_payment_frequency]
      : null,
    advisorLabel: advisorOptions.find((option) => option.value === values.accountant_id)?.label ?? null,
    businessDisplayName:
      (isCompany ? values.full_name?.trim() : values.business_name?.trim() || values.full_name?.trim()) || null,
    addressLine,
    impactTotal: impactData?.items.reduce((sum, item) => sum + item.count, 0) ?? 0,
  }
}
