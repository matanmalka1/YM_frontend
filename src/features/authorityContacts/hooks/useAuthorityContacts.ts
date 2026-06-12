import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authorityContactsApi, authorityContactsQK } from '../api'
import { getErrorMessage, showErrorToast } from '../../../utils/utils'
import { toast } from '../../../utils/toast'
import { AUTHORITY_CONTACTS_LIST_PARAMS, AUTHORITY_CONTACT_TEXT } from '../constants'

export const useAuthorityContacts = (clientId: number) => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState<number>(AUTHORITY_CONTACTS_LIST_PARAMS.page)
  const pageSize = AUTHORITY_CONTACTS_LIST_PARAMS.page_size
  const qk = [...authorityContactsQK.forClient(clientId), { page, page_size: pageSize }]

  const listQuery = useQuery({
    enabled: clientId > 0,
    queryKey: qk,
    queryFn: () => authorityContactsApi.listAuthorityContacts(clientId, undefined, page, pageSize),
  })

  const deleteMutation = useMutation({
    mutationFn: (contactId: number) => authorityContactsApi.deleteAuthorityContact(contactId),
    onSuccess: () => {
      toast.success(AUTHORITY_CONTACT_TEXT.deleteSuccess)
      queryClient.invalidateQueries({ queryKey: authorityContactsQK.forClient(clientId) })
    },
    onError: (err) => showErrorToast(err, AUTHORITY_CONTACT_TEXT.deleteError),
  })

  const total = listQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return {
    contacts: listQuery.data?.items ?? [],
    total,
    page,
    setPage,
    totalPages,
    isLoading: listQuery.isLoading,
    error: listQuery.error ? getErrorMessage(listQuery.error, AUTHORITY_CONTACT_TEXT.loadError) : null,
    deleteContact: (id: number) => deleteMutation.mutate(id),
    deletingId: deleteMutation.isPending ? (deleteMutation.variables ?? null) : null,
  }
}
