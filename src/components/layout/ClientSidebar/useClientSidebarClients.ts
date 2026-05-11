import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientsApi, clientsQK, type ClientRecordResponse } from '@/features/clients'

const CLIENT_SIDEBAR_PAGE_SIZE = 100

const QUERY_PARAMS = {
  page: 1,
  page_size: CLIENT_SIDEBAR_PAGE_SIZE,
  sort_by: 'full_name',
  sort_order: 'asc',
} as const

export interface ClientSidebarItem {
  id: number
  displayName: string
  officeClientNumber: number | null
  phone: string | null
  email: string | null
  entityType: ClientRecordResponse['entity_type']
  vatReportingFrequency: ClientRecordResponse['vat_reporting_frequency']
}

const normalizeSearch = (value: string): string => value.trim().toLocaleLowerCase('he-IL')

const toSidebarItem = (client: ClientRecordResponse): ClientSidebarItem => ({
  id: client.id,
  displayName: client.full_name,
  officeClientNumber: client.office_client_number,
  phone: client.phone,
  email: client.email,
  entityType: client.entity_type,
  vatReportingFrequency: client.vat_reporting_frequency,
})

const matchesSearch = (client: ClientSidebarItem, search: string): boolean => {
  if (!search) return true

  return [
    client.displayName,
    client.officeClientNumber == null ? null : String(client.officeClientNumber),
    client.phone,
    client.email,
  ].some((value) => normalizeSearch(value ?? '').includes(search))
}

export const useClientSidebarClients = (searchValue: string) => {
  const query = useQuery({
    queryKey: clientsQK.list(QUERY_PARAMS),
    queryFn: () => clientsApi.list(QUERY_PARAMS),
  })

  const search = normalizeSearch(searchValue)
  const clients = useMemo(
    () => (query.data?.items ?? []).map(toSidebarItem).filter((client) => matchesSearch(client, search)),
    [query.data?.items, search],
  )

  return {
    clients,
    total: query.data?.total ?? 0,
    isLoading: query.isPending,
    isError: query.isError,
  }
}
