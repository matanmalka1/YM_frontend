import { createQueryKeys } from '@/lib/queryKeys'
import type { TaxCalendarSettingsYearRangeParams } from './contracts'

export const taxCalendarSettingsQK = {
  ...createQueryKeys(['settings', 'tax-calendar'] as const),
  rules: () => ['settings', 'tax-calendar', 'rules'] as const,
  entries: (params: TaxCalendarSettingsYearRangeParams | null) => ['settings', 'tax-calendar', 'entries', params] as const,
  summary: (params: TaxCalendarSettingsYearRangeParams | null) => ['settings', 'tax-calendar', 'summary', params] as const,
}
