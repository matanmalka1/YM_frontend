import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authorityContactsApi, authorityContactsQK } from '../api'
import { getErrorMessage } from '../../../utils/utils'
import { getTotalPages } from '@/utils/paginationUtils'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { AUTHORITY_CONTACTS_LIST_PARAMS, AUTHORITY_CONTACT_TEXT } from '../constants'

export const useAuthorityContacts = (clientId: number) => {
  const [page, setPage] = useState<number>(AUTHORITY_CONTACTS_LIST_PARAMS.page)
  const pageSize = AUTHORITY_CONTACTS_LIST_PARAMS.page_size
  const listParams = { page, page_size: pageSize }
  const qk = authorityContactsQK.list(clientId, listParams)

  const listQuery = useQuery({
    enabled: clientId > 0,
    queryKey: qk,
    queryFn: () => authorityContactsApi.listAuthorityContacts(clientId, listParams),
  })

  const deleteMutation = useMutationWithToast({
    mutationFn: (contactId: number) => authorityContactsApi.deleteAuthorityContact(clientId, contactId),
    successMessage: AUTHORITY_CONTACT_TEXT.deleteSuccess,
    errorMessage: AUTHORITY_CONTACT_TEXT.deleteError,
    invalidateKeys: [authorityContactsQK.forClient(clientId)],
  })

  const total = listQuery.data?.total ?? 0
  const totalPages = getTotalPages(total, pageSize)

  return {
    contacts: listQuery.data?.items ?? [],
    total,
    page,
    setPage,
    totalPages,
    isLoading: listQuery.isLoading,
    error: listQuery.error ? getErrorMessage(listQuery.error, AUTHORITY_CONTACT_TEXT.loadError) : null,
    retry: () => {
      void listQuery.refetch()
    },
    deleteContact: (id: number) => deleteMutation.mutateAsync(id),
    deletingId: deleteMutation.isPending ? (deleteMutation.variables ?? null) : null,
  }
}
