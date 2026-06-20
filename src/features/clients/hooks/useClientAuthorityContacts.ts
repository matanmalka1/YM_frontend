import { useQuery } from '@tanstack/react-query'
import { authorityContactsApi, authorityContactsQK, type ContactType } from '@/features/authorityContacts'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { PAGE_SIZE_SM as PAGE_SIZE } from '@/constants/pagination.constants'

const PAGE = 1
const LIST_PARAMS = { page: PAGE, page_size: PAGE_SIZE }
const DEFAULT_BRANCH_CONTACT_TYPES = new Set<ContactType>(['assessing_officer', 'vat_branch', 'national_insurance'])

const normalizeBranchCity = (city: string | null | undefined): string | null => {
  const normalized = city?.trim()
  return normalized ? normalized : null
}

export const useClientAuthorityContacts = (clientId: number, addressCity?: string | null) => {
  const { data } = useQuery({
    queryKey: authorityContactsQK.list(clientId, LIST_PARAMS),
    queryFn: () => authorityContactsApi.listAuthorityContacts(clientId, LIST_PARAMS),
    enabled: clientId > 0,
    staleTime: QUERY_STALE_TIME.long,
  })

  const contacts = data?.items ?? []
  const defaultBranchOffice = normalizeBranchCity(addressCity)

  const officeByType = (type: ContactType): string | null => {
    const manualOffice = normalizeBranchCity(contacts.find((c) => c.contact_type === type)?.office)
    if (manualOffice) return manualOffice
    return DEFAULT_BRANCH_CONTACT_TYPES.has(type) ? defaultBranchOffice : null
  }

  return { officeByType }
}
