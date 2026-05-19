import type { DefinitionItem } from '@/components/ui/layout/DefinitionList'
import { getVatTypeLabel } from '@/features/clients'
import {
  EMPTY_TAX_PROFILE_VALUE,
  TAX_PROFILE_FIELD_LABELS,
  TAX_PROFILE_TEXT,
  VAT_REPORTING_FREQUENCIES,
} from './constants'
import { taxProfileDefaults, type TaxProfileFormValues } from './schemas'
import type { TaxProfileData, TaxProfileUpdatePayload } from './api'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export const getTaxProfileFormValues = (profile: TaxProfileData | null): TaxProfileFormValues => {
  if (!profile) {
    return taxProfileDefaults
  }

  return {
    vat_reporting_frequency: profile.vat_reporting_frequency ?? taxProfileDefaults.vat_reporting_frequency,
    accountant_id: profile.accountant_id != null ? String(profile.accountant_id) : '',
    advance_rate: profile.advance_rate ?? '',
  }
}

export const toTaxProfileUpdatePayload = (values: TaxProfileFormValues): TaxProfileUpdatePayload => ({
  vat_reporting_frequency: values.vat_reporting_frequency,
  accountant_id: values.accountant_id ? Number(values.accountant_id) : null,
  advance_rate: values.advance_rate || null,
})

export const VAT_REPORTING_FREQUENCY_OPTIONS: SelectOption[] = VAT_REPORTING_FREQUENCIES.map((value) => ({
  value,
  label: getVatTypeLabel(value),
}))

export const getAdvisorSelectOptions = (advisorOptions: SelectOption[], isLoading: boolean): SelectOption[] => [
  {
    value: '',
    label: isLoading ? TAX_PROFILE_TEXT.advisorsLoading : TAX_PROFILE_TEXT.advisorUnset,
  },
  ...advisorOptions,
]

export const getTaxProfileItems = (
  profile: TaxProfileData | null,
  advisorNameById: Map<number, string>,
): DefinitionItem[] => [
  {
    label: TAX_PROFILE_FIELD_LABELS.vatReportingFrequency,
    value: profile?.vat_reporting_frequency
      ? getVatTypeLabel(profile.vat_reporting_frequency)
      : EMPTY_TAX_PROFILE_VALUE,
  },
  {
    label: TAX_PROFILE_FIELD_LABELS.accountant,
    value: profile?.accountant_id
      ? (advisorNameById.get(profile.accountant_id) ?? `#${profile.accountant_id}`)
      : EMPTY_TAX_PROFILE_VALUE,
  },
  {
    label: TAX_PROFILE_FIELD_LABELS.advanceRate,
    value: profile?.advance_rate != null ? `${profile.advance_rate}%` : EMPTY_TAX_PROFILE_VALUE,
  },
]
