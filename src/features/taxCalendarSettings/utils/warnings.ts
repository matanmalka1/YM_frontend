import type { TaxCalendarWarning } from '../api'
import { TAX_CALENDAR_SETTINGS_MESSAGES } from '../messages'
import { TAX_CALENDAR_SUMMARY_TYPE_LABELS } from '../constants'

export const translateTaxCalendarWarning = (warning: TaxCalendarWarning): string => {
  switch (warning.code) {
    case 'count_mismatch': {
      const label =
        TAX_CALENDAR_SUMMARY_TYPE_LABELS[warning.obligation_type as keyof typeof TAX_CALENDAR_SUMMARY_TYPE_LABELS] ??
        warning.obligation_type
      return TAX_CALENDAR_SETTINGS_MESSAGES.warnings.countMismatch(
        String(warning.year),
        label,
        String(warning.expected),
        String(warning.found),
      )
    }
    case 'registry_data_missing':
      return TAX_CALENDAR_SETTINGS_MESSAGES.warnings.fallbackDates(String(warning.year))
    case 'bootstrap_count_mismatch':
      return TAX_CALENDAR_SETTINGS_MESSAGES.warnings.bootstrapCountMismatch(
        String(warning.tax_year_after),
        String(warning.tax_year_before),
        String(warning.expected),
        String(warning.found),
      )
  }
}
