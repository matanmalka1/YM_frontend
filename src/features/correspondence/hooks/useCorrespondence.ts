import { useQuery } from '@tanstack/react-query'
import { correspondenceApi, correspondenceQK } from '../api'
import { authorityContactsApi, authorityContactsQK, AUTHORITY_CONTACTS_LIST_PARAMS } from '@/features/authorityContacts'
import { getErrorMessage } from '../../../utils/utils'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import type { CorrespondenceFormValues } from '../schemas'
import { CORRESPONDENCE_LIST_PARAMS } from '../constants'
import { toCreateCorrespondencePayload, toUpdateCorrespondencePayload } from '../utils'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { CORRESPONDENCE_ERROR_MESSAGES } from '../errorMessages'

export const useCorrespondence = (businessId: number | undefined, clientId?: number, loadContacts = false) => {
  const resolvedClientId = clientId ?? 0
  const listParams = { ...CORRESPONDENCE_LIST_PARAMS, business_id: businessId }
  const queryKey = [...correspondenceQK.forClient(resolvedClientId), listParams]

  const {
    data: listData,
    isLoading: listLoading,
    error: listError,
  } = useQuery({
    enabled: resolvedClientId > 0,
    queryKey,
    queryFn: () => correspondenceApi.list(resolvedClientId, listParams),
    retry: false,
  })

  const { data: contactsData } = useQuery({
    enabled: loadContacts && resolvedClientId > 0,
    queryKey: authorityContactsQK.list(resolvedClientId, AUTHORITY_CONTACTS_LIST_PARAMS),
    queryFn: () => authorityContactsApi.listAuthorityContacts(resolvedClientId, AUTHORITY_CONTACTS_LIST_PARAMS),
    staleTime: QUERY_STALE_TIME.medium,
  })

  const createMutation = useMutationWithToast({
    mutationFn: (values: CorrespondenceFormValues) =>
      correspondenceApi.create(resolvedClientId, toCreateCorrespondencePayload(values, businessId)),
    successMessage: 'רשומת התכתבות נוספה בהצלחה',
    errorMessage: CORRESPONDENCE_ERROR_MESSAGES.create,
    invalidateKeys: [queryKey],
  })

  const updateMutation = useMutationWithToast({
    mutationFn: ({ id, values }: { id: number; values: CorrespondenceFormValues }) =>
      correspondenceApi.update(resolvedClientId, id, toUpdateCorrespondencePayload(values, businessId)),
    successMessage: 'רשומת התכתבות עודכנה בהצלחה',
    errorMessage: CORRESPONDENCE_ERROR_MESSAGES.update,
    invalidateKeys: [queryKey],
  })

  const deleteMutation = useMutationWithToast({
    mutationFn: (id: number) => correspondenceApi.delete(resolvedClientId, id),
    successMessage: 'רשומת התכתבות נמחקה בהצלחה',
    errorMessage: CORRESPONDENCE_ERROR_MESSAGES.delete,
    invalidateKeys: [queryKey],
  })

  const deletingId = deleteMutation.isPending ? (deleteMutation.variables ?? null) : null

  return {
    entries: listData?.items ?? [],
    total: listData?.total ?? 0,
    isLoading: listLoading,
    error: listError ? getErrorMessage(listError, CORRESPONDENCE_ERROR_MESSAGES.load) : null,
    contacts: contactsData?.items ?? [],
    createEntry: (values: CorrespondenceFormValues) => createMutation.mutateAsync(values),
    isCreating: createMutation.isPending,
    updateEntry: (id: number, values: CorrespondenceFormValues) => updateMutation.mutateAsync({ id, values }),
    isUpdating: updateMutation.isPending,
    deleteEntry: (id: number) => deleteMutation.mutate(id),
    deletingId,
  }
}
