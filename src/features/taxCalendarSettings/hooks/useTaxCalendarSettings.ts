import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/utils/toast'
import { showErrorToast } from '@/utils/utils'
import {
  taxCalendarSettingsApi,
  taxCalendarSettingsQK,
  type TaxCalendarBootstrapPayload,
  type TaxCalendarSettingsYearRangeParams,
} from '../api'

export const useTaxCalendarSettings = (params: TaxCalendarSettingsYearRangeParams | null, enabled = true) => {
  const queryClient = useQueryClient()
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

  const bootstrapMutation = useMutation({
    mutationFn: (payload: TaxCalendarBootstrapPayload) => taxCalendarSettingsApi.bootstrap(payload),
    onSuccess: async (result) => {
      toast.success(`יומן המס אותחל: ${result.entries_created} רשומות נוצרו, ${result.entries_skipped} רשומות דולגו.`)
      await queryClient.invalidateQueries({ queryKey: taxCalendarSettingsQK.all })
    },
    onError: (error) => showErrorToast(error, 'שגיאה באתחול יומן המס'),
  })

  return {
    rulesQuery,
    entriesQuery,
    summaryQuery,
    bootstrapMutation,
  }
}
