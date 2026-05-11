export interface TaxCalendarSettingsYearRangeParams {
  start_year: number
  end_year: number
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

export interface TaxCalendarSettingsSummary {
  start_year: number | null
  end_year: number | null
  total_entries: number
  per_year: Record<string, Record<string, number>>
  warnings: string[]
}
