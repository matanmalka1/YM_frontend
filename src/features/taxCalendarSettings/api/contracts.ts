export interface TaxCalendarSettingsYearRangeParams {
  tax_year_after: number
  tax_year_before: number
}

export interface TaxCalendarBootstrapPayload {
  tax_year_after: number
  tax_year_before: number
}

export interface TaxCalendarDeadlineRule {
  id: number
  rule_type: string
  due_day_of_month: number
  offset_months: number
  effective_from: string
  effective_to: string | null
  description: string | null
}

export interface TaxCalendarSettingsEntry {
  id: number
  obligation_type: string
  period: string | null
  period_months_count: number | null
  tax_year: number
  due_date: string
  deadline_rule_id: number
}

export type TaxCalendarWarning =
  | { code: 'count_mismatch'; year: number; obligation_type: string; expected: number; found: number }
  | { code: 'registry_data_missing'; year: number }
  | {
      code: 'bootstrap_count_mismatch'
      tax_year_after: number
      tax_year_before: number
      expected: number
      found: number
      expected_per_year: number
    }

export interface TaxCalendarSettingsSummary {
  tax_year_after: number | null
  tax_year_before: number | null
  total_entries: number
  per_year: Record<string, Record<string, number>>
  warnings: TaxCalendarWarning[]
}

export interface TaxCalendarBootstrapResult {
  tax_year_after: number
  tax_year_before: number
  rules_created: number
  rules_skipped: number
  rules_by_type: Record<string, string>
  entries_created: number
  entries_skipped: number
  total_entries_for_range: number
  warnings: TaxCalendarWarning[]
}
