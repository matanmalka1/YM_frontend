import { useQuery } from '@tanstack/react-query'
import { getErrorMessage } from '@/utils/utils'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { PAGE_SIZE_MD } from '@/constants/pagination.constants'
import { NOTES_ERROR_MESSAGES } from '../errorMessages'

const PAGE_PARAMS = { page: 1, page_size: PAGE_SIZE_MD }

interface UseNotesResourceOptions<TNote> {
  enabled: boolean
  queryKey: unknown[]
  list: () => Promise<{ items: TNote[]; total: number }>
  create: (note: string) => Promise<TNote>
  update: (noteId: number, note: string) => Promise<TNote>
  remove: (noteId: number) => Promise<unknown>
}

export const notesPageParams = PAGE_PARAMS

export const useNotesResource = <TNote>({ enabled, queryKey, list, create, update, remove }: UseNotesResourceOptions<TNote>) => {
  const {
    data: listData,
    isLoading: listLoading,
    error: listError,
  } = useQuery({
    enabled,
    queryKey,
    queryFn: list,
    retry: false,
  })

  const createMutation = useMutationWithToast({
    mutationFn: create,
    successMessage: 'הערה נוספה בהצלחה',
    errorMessage: NOTES_ERROR_MESSAGES.create,
    invalidateKeys: [queryKey],
  })

  const updateMutation = useMutationWithToast({
    mutationFn: ({ noteId, note }: { noteId: number; note: string }) => update(noteId, note),
    successMessage: 'הערה עודכנה בהצלחה',
    errorMessage: NOTES_ERROR_MESSAGES.update,
    invalidateKeys: [queryKey],
  })

  const deleteMutation = useMutationWithToast({
    mutationFn: remove,
    successMessage: 'הערה נמחקה בהצלחה',
    errorMessage: NOTES_ERROR_MESSAGES.delete,
    invalidateKeys: [queryKey],
  })

  return {
    notes: listData?.items ?? [],
    total: listData?.total ?? 0,
    isLoading: listLoading,
    error: listError ? getErrorMessage(listError, NOTES_ERROR_MESSAGES.load) : null,
    addNote: (note: string) => createMutation.mutateAsync(note),
    isAdding: createMutation.isPending,
    updateNote: (noteId: number, note: string) => updateMutation.mutateAsync({ noteId, note }),
    isUpdating: updateMutation.isPending,
    deleteNote: (noteId: number) => deleteMutation.mutate(noteId),
    deletingId: deleteMutation.isPending ? (deleteMutation.variables ?? null) : null,
  }
}
