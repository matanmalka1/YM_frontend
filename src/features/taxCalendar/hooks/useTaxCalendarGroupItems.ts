import { useQuery } from '@tanstack/react-query'
import { taxCalendarApi, taxCalendarQK } from '../api'

export const useTaxCalendarGroupItems = (taxCalendarEntryId: number, enabled: boolean) =>
  useQuery({
    queryKey: taxCalendarQK.groupItems(taxCalendarEntryId),
    queryFn: () => taxCalendarApi.getGroupItems(taxCalendarEntryId),
    enabled,
  })
