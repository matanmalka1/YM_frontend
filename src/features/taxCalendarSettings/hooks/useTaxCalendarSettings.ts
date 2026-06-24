import { useQuery } from '@tanstack/react-query'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import {
  taxCalendarSettingsApi,
  taxCalendarSettingsQK,
  type TaxCalendarBootstrapPayload,
  type TaxCalendarSettingsYearRangeParams,
} from '../api'
import { TAX_CALENDAR_SETTINGS_ERROR_MESSAGES } from '../errorMessages'

export const useTaxCalendarSettings = (params: TaxCalendarSettingsYearRangeParams | null, enabled = true) => {
  const rulesQuery = useQuery({
    queryKey: taxCalendarSettingsQK.rules(),
    queryFn: taxCalendarSettingsApi.listRules,
  })

  const entriesQuery = useQuery({
    queryKey: taxCalendarSettingsQK.entries(params),
    queryFn: () => {
      if (!params) throw new Error('Missing tax calendar year range params')
      return taxCalendarSettingsApi.listEntries(params)
    },
    enabled: enabled && params !== null,
  })

  const summaryQuery = useQuery({
    queryKey: taxCalendarSettingsQK.summary(params),
    queryFn: () => {
      if (!params) throw new Error('Missing tax calendar year range params')
      return taxCalendarSettingsApi.getSummary(params)
    },
    enabled: enabled && params !== null,
  })

  const bootstrapMutation = useMutationWithToast({
    mutationFn: (payload: TaxCalendarBootstrapPayload) => taxCalendarSettingsApi.bootstrap(payload),
    successMessage: (result) =>
      `יומן המס אותחל: ${result.entries_created} רשומות נוצרו, ${result.entries_skipped} רשומות דולגו.`,
    errorMessage: TAX_CALENDAR_SETTINGS_ERROR_MESSAGES.bootstrap,
    invalidateKeys: [taxCalendarSettingsQK.all],
  })

  return {
    rulesQuery,
    entriesQuery,
    summaryQuery,
    bootstrapMutation,
  }
}
