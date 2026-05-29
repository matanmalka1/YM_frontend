import { useQuery } from '@tanstack/react-query'
import { authorityContactsApi, authorityContactsQK, type ContactType } from '@/features/authorityContacts'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

const PAGE = 1
const PAGE_SIZE = 20
const DEFAULT_BRANCH_CONTACT_TYPES = new Set<ContactType>(['assessing_officer', 'vat_branch', 'national_insurance'])

const normalizeBranchCity = (city: string | null | undefined): string | null => {
  const normalized = city?.trim()
  return normalized ? normalized : null
}

export const useClientAuthorityContacts = (clientId: number, addressCity?: string | null) => {
  const { data } = useQuery({
    queryKey: [...authorityContactsQK.forClient(clientId), { page: PAGE, page_size: PAGE_SIZE }],
    queryFn: () => authorityContactsApi.listAuthorityContacts(clientId, undefined, PAGE, PAGE_SIZE),
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
