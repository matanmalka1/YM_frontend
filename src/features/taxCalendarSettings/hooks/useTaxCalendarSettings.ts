import { useQuery } from '@tanstack/react-query'
import { taxCalendarSettingsApi, taxCalendarSettingsQK, type TaxCalendarSettingsYearRangeParams } from '../api'

export const useTaxCalendarSettings = (params: TaxCalendarSettingsYearRangeParams | null, enabled = true) => {
  const rulesQuery = useQuery({
    queryKey: [...taxCalendarSettingsQK.all, 'rules'] as const,
    queryFn: taxCalendarSettingsApi.listRules,
  })

  const entriesQuery = useQuery({
    queryKey: [...taxCalendarSettingsQK.all, 'entries', params] as const,
    queryFn: () => {
      if (!params) throw new Error('Missing tax calendar year range params')
      return taxCalendarSettingsApi.listEntries(params)
    },
    enabled: enabled && params !== null,
  })

  const summaryQuery = useQuery({
    queryKey: [...taxCalendarSettingsQK.all, 'summary', params] as const,
    queryFn: () => {
      if (!params) throw new Error('Missing tax calendar year range params')
      return taxCalendarSettingsApi.getSummary(params)
    },
    enabled: enabled && params !== null,
  })

  return {
    rulesQuery,
    entriesQuery,
    summaryQuery,
  }
}
