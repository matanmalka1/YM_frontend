import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientsApi, clientsQK, type ClientSidebarResponse } from '@/features/clients'
import type { ListClientSidebarParams } from '@/features/clients/api'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

export const CLIENT_SIDEBAR_PAGE_SIZE = 100

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

  const query = useQuery({
    queryKey: clientsQK.sidebar(queryParams),
    queryFn: () => clientsApi.listSidebar(queryParams),
    staleTime: QUERY_STALE_TIME.long,
    gcTime: 1000 * 60 * 30,
  })

  const clients = useMemo(() => (query.data?.items ?? []).map(toSidebarItem), [query.data?.items])

  return {
    clients,
    total: query.data?.total ?? 0,
    hasSearch: search.length > 0,
    isLoading: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
  }
}
