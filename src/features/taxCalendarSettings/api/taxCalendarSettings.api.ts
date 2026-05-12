import { api } from '@/api/client'
import { toQueryParams } from '@/api/queryParams'
import { randomUUID } from '@/utils/random'
import { TAX_CALENDAR_SETTINGS_ENDPOINTS } from './endpoints'
import type {
  TaxCalendarBootstrapPayload,
  TaxCalendarBootstrapResult,
  TaxCalendarDeadlineRule,
  TaxCalendarSettingsEntry,
  TaxCalendarSettingsSummary,
  TaxCalendarSettingsYearRangeParams,
} from './contracts'

export const taxCalendarSettingsApi = {
  listRules: async (): Promise<TaxCalendarDeadlineRule[]> => {
    const response = await api.get<TaxCalendarDeadlineRule[]>(TAX_CALENDAR_SETTINGS_ENDPOINTS.rules)
    return response.data
  },

  listEntries: async (params: TaxCalendarSettingsYearRangeParams): Promise<TaxCalendarSettingsEntry[]> => {
    const response = await api.get<TaxCalendarSettingsEntry[]>(TAX_CALENDAR_SETTINGS_ENDPOINTS.entries, {
      params: toQueryParams(params),
    })
    return response.data
  },

  getSummary: async (params: TaxCalendarSettingsYearRangeParams): Promise<TaxCalendarSettingsSummary> => {
    const response = await api.get<TaxCalendarSettingsSummary>(TAX_CALENDAR_SETTINGS_ENDPOINTS.summary, {
      params: toQueryParams(params),
    })
    return response.data
  },

  bootstrap: async (payload: TaxCalendarBootstrapPayload): Promise<TaxCalendarBootstrapResult> => {
    const response = await api.post<TaxCalendarBootstrapResult>(TAX_CALENDAR_SETTINGS_ENDPOINTS.bootstrap, payload, {
      headers: {
        'X-Idempotency-Key': randomUUID(),
      },
    })
    return response.data
  },
}
