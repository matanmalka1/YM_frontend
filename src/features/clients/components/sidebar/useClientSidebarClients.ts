import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientsApi, clientsQK, type ClientSidebarResponse, type ListClientSidebarParams } from '../../api'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { PAGE_SIZE_LG } from '@/constants/pagination.constants'

export const CLIENT_SIDEBAR_PAGE_SIZE = PAGE_SIZE_LG

const BASE_QUERY_PARAMS = {
  page: 1,
  page_size: CLIENT_SIDEBAR_PAGE_SIZE,
  sort_by: 'full_name',
  order: 'asc',
} satisfies ListClientSidebarParams

export interface ClientSidebarItem {
  id: number
  displayName: string
  officeClientNumber: number | null
  phone: string | null
  email: string | null
  entityType: ClientSidebarResponse['entity_type']
  vatReportingFrequency: ClientSidebarResponse['vat_reporting_frequency']
}

const normalizeSearch = (value: string): string => value.trim().toLocaleLowerCase('he-IL')

const toSidebarItem = (client: ClientSidebarResponse): ClientSidebarItem => ({
  id: client.id,
  displayName: client.full_name,
  officeClientNumber: client.office_client_number,
  phone: client.phone,
  email: client.email,
  entityType: client.entity_type,
  vatReportingFrequency: client.vat_reporting_frequency,
})

export const useClientSidebarClients = (searchValue: string) => {
  const search = normalizeSearch(searchValue)
  const queryParams = useMemo<ListClientSidebarParams>(
    () => ({
      ...BASE_QUERY_PARAMS,
      search: search || undefined,
    }),
    [search],
  )

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: clientsQK.sidebar(queryParams),
    queryFn: () => clientsApi.listSidebar(queryParams),
    staleTime: QUERY_STALE_TIME.long,
    gcTime: 1000 * 60 * 30,
  })

  const clients = useMemo(() => (data?.items ?? []).map(toSidebarItem), [data?.items])

  return {
    clients,
    total: data?.total ?? 0,
    hasSearch: search.length > 0,
    isLoading: isPending,
    isError,
    refetch,
  }
}
