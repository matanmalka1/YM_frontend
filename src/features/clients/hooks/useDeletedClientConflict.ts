import { useCallback, useState } from 'react'
import { useMutationWithToast } from '../../../hooks/useMutationWithToast'
import { clientsApi, clientsQK } from '../api'
import type { DeletedClientSummary } from '../api/contracts'
import { showErrorToast } from '../../../utils/utils'
import { extractClientErrorCode } from '../utils/clientErrors'
import { CLIENTS_ERROR_MESSAGES } from '../errorMessages'

// Owns the deleted-client conflict flow: when creating a client collides with a
// soft-deleted record, surface a dialog and let the user restore it instead.
export const useDeletedClientConflict = () => {
  const [deletedClientInfo, setDeletedClientInfo] = useState<DeletedClientSummary | null>(null)

  const restoreMutation = useMutationWithToast<Awaited<ReturnType<typeof clientsApi.restore>>, number>({
    mutationFn: (clientId) => clientsApi.restore(clientId),
    successMessage: 'הלקוח שוחזר בהצלחה',
    errorMessage: CLIENTS_ERROR_MESSAGES.client.restore,
    invalidateKeys: [clientsQK.all],
    onSuccess: () => setDeletedClientInfo(null),
  })

  // Inspect a create failure; if it is a deleted-client conflict, load the
  // deleted record and open the dialog. Returns true when it handled the error.
  const handleCreateError = useCallback(async (err: unknown, idNumber: string): Promise<boolean> => {
    if (extractClientErrorCode(err) !== 'CLIENT.DELETED_EXISTS') return false
    try {
      const deleted = await clientsApi.getConflictByIdNumber(idNumber)
      setDeletedClientInfo(deleted.deleted_clients[0] ?? null)
    } catch {
      showErrorToast(err, CLIENTS_ERROR_MESSAGES.client.create)
    }
    return true
  }, [])

  const clearConflict = useCallback(() => setDeletedClientInfo(null), [])

  const handleRestoreClient = useCallback(() => {
    if (!deletedClientInfo) return
    restoreMutation.mutate(deletedClientInfo.id)
  }, [deletedClientInfo, restoreMutation])

  const restoreDeletedClient = useCallback(
    async (clientId: number) => {
      const restored = await restoreMutation.mutateAsync(clientId)
      setDeletedClientInfo(null)
      return restored
    },
    [restoreMutation],
  )

  return {
    deletedClientInfo,
    isOpen: deletedClientInfo !== null,
    restoreLoading: restoreMutation.isPending,
    handleCreateError,
    clearConflict,
    handleRestoreClient,
    restoreDeletedClient,
  }
}
