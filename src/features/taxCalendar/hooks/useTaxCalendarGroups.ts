import { useQuery } from '@tanstack/react-query'
import { taxCalendarApi, taxCalendarQK, type TaxCalendarGroupsParams } from '../api'

export const useTaxCalendarGroups = (params: TaxCalendarGroupsParams = {}) =>
  useQuery({
    queryKey: taxCalendarQK.groups(params),
    queryFn: () => taxCalendarApi.listGroups(params),
  })
