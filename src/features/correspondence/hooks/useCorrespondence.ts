import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { correspondenceApi, correspondenceQK } from '../api'
import { authorityContactsApi, authorityContactsQK, AUTHORITY_CONTACTS_LIST_PARAMS } from '@/features/authorityContacts'
import { getErrorMessage, showErrorToast } from '../../../utils/utils'
import type { CorrespondenceFormValues } from '../schemas'
import { toast } from '../../../utils/toast'
import { CORRESPONDENCE_LIST_PARAMS } from '../constants'
import { toCreateCorrespondencePayload, toUpdateCorrespondencePayload } from '../utils'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

export const useCorrespondence = (businessId: number | undefined, clientId?: number, loadContacts = false) => {
  const queryClient = useQueryClient()
  const resolvedClientId = clientId ?? 0
  const listParams = { ...CORRESPONDENCE_LIST_PARAMS, business_id: businessId }
  const queryKey = [...correspondenceQK.forClient(resolvedClientId), listParams]

  const listQuery = useQuery({
    enabled: resolvedClientId > 0,
    queryKey,
    queryFn: () => correspondenceApi.list(resolvedClientId, listParams),
    retry: false,
  })

  const contactsQuery = useQuery({
    enabled: loadContacts && resolvedClientId > 0,
    queryKey: [...authorityContactsQK.forClient(resolvedClientId), AUTHORITY_CONTACTS_LIST_PARAMS],
    queryFn: () =>
      authorityContactsApi.listAuthorityContacts(
        resolvedClientId,
        undefined,
        AUTHORITY_CONTACTS_LIST_PARAMS.page,
        AUTHORITY_CONTACTS_LIST_PARAMS.page_size,
      ),
    staleTime: QUERY_STALE_TIME.medium,
  })

  const createMutation = useMutation({
    mutationFn: (values: CorrespondenceFormValues) =>
      correspondenceApi.create(resolvedClientId, toCreateCorrespondencePayload(values, businessId)),
    onSuccess: () => {
      toast.success('רשומת התכתבות נוספה בהצלחה')
      void queryClient.invalidateQueries({ queryKey })
    },
    onError: (err) => showErrorToast(err, 'שגיאה בהוספת רשומה'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: CorrespondenceFormValues }) =>
      correspondenceApi.update(resolvedClientId, id, toUpdateCorrespondencePayload(values)),
    onSuccess: () => {
      toast.success('רשומת התכתבות עודכנה בהצלחה')
      void queryClient.invalidateQueries({ queryKey })
    },
    onError: (err) => showErrorToast(err, 'שגיאה בעדכון רשומה'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => correspondenceApi.delete(resolvedClientId, id),
    onSuccess: () => {
      toast.success('רשומת התכתבות נמחקה בהצלחה')
      void queryClient.invalidateQueries({ queryKey })
    },
    onError: (err) => showErrorToast(err, 'שגיאה במחיקת רשומה'),
  })

  const deletingId = deleteMutation.isPending ? (deleteMutation.variables ?? null) : null

  return {
    entries: listQuery.data?.items ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    error: listQuery.error ? getErrorMessage(listQuery.error, 'שגיאה בטעינת התכתבויות') : null,
    contacts: contactsQuery.data?.items ?? [],
    createEntry: (values: CorrespondenceFormValues) => createMutation.mutateAsync(values),
    isCreating: createMutation.isPending,
    updateEntry: (id: number, values: CorrespondenceFormValues) => updateMutation.mutateAsync({ id, values }),
    isUpdating: updateMutation.isPending,
    deleteEntry: (id: number) => deleteMutation.mutate(id),
    deletingId,
  }
}
