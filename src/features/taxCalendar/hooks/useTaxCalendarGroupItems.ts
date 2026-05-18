import { useQuery } from '@tanstack/react-query'
import { taxCalendarApi, taxCalendarQK, type TaxCalendarGroupItemsParams } from '../api'

export const useTaxCalendarGroupItems = (
  taxCalendarEntryId: number,
  enabled: boolean,
  params: TaxCalendarGroupItemsParams = {},
) =>
  useQuery({
    queryKey: taxCalendarQK.groupItems(taxCalendarEntryId, params),
    queryFn: () => taxCalendarApi.getGroupItems(taxCalendarEntryId, params),
    enabled,
  })
