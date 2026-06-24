import { bindersApi, bindersQK } from '../api'
import { useMutationWithToast } from '../../../hooks/useMutationWithToast'
import { BINDERS_MESSAGES } from '../messages'
import { BINDERS_ERROR_MESSAGES } from '../errorMessages'

export const useBinderMutations = (onDeleteSuccess: () => void) => {
  const deleteMutation = useMutationWithToast<void, number>({
    mutationFn: (binderId) => bindersApi.delete(binderId),
    successMessage: BINDERS_MESSAGES.mutations.deleteSuccess,
    errorMessage: BINDERS_ERROR_MESSAGES.mutations.deleteError,
    invalidateKeys: [bindersQK.all],
    onSuccess: onDeleteSuccess,
  })

  const markReadyForHandoverMutation = useMutationWithToast<
    Awaited<ReturnType<typeof bindersApi.markReadyForHandover>>,
    number
  >({
    mutationFn: (binderId) => bindersApi.markReadyForHandover(binderId),
    successMessage: BINDERS_MESSAGES.mutations.markReadySuccess,
    errorMessage: BINDERS_ERROR_MESSAGES.mutations.markReadyError,
    invalidateKeys: [bindersQK.all],
  })

  const receiveMaterialMutation = useMutationWithToast<Awaited<ReturnType<typeof bindersApi.receiveMaterial>>, number>({
    mutationFn: (binderId) => bindersApi.receiveMaterial(binderId),
    successMessage: BINDERS_MESSAGES.mutations.receiveMaterialSuccess,
    errorMessage: BINDERS_ERROR_MESSAGES.mutations.receiveMaterialError,
    invalidateKeys: [bindersQK.all],
  })

  const markFullMutation = useMutationWithToast<Awaited<ReturnType<typeof bindersApi.markFull>>, number>({
    mutationFn: (binderId) => bindersApi.markFull(binderId),
    successMessage: BINDERS_MESSAGES.mutations.markFullSuccess,
    errorMessage: BINDERS_ERROR_MESSAGES.mutations.markFullError,
    invalidateKeys: [bindersQK.all],
  })

  const reopenCapacityMutation = useMutationWithToast<Awaited<ReturnType<typeof bindersApi.reopenCapacity>>, number>({
    mutationFn: (binderId) => bindersApi.reopenCapacity(binderId),
    successMessage: BINDERS_MESSAGES.mutations.reopenCapacitySuccess,
    errorMessage: BINDERS_ERROR_MESSAGES.mutations.reopenCapacityError,
    invalidateKeys: [bindersQK.all],
  })

  const markReadyForHandoverBulkMutation = useMutationWithToast<
    Awaited<ReturnType<typeof bindersApi.markReadyForHandoverBulk>>,
    { clientId: number; untilPeriodYear: number; untilPeriodMonth: number }
  >({
    mutationFn: ({ clientId, untilPeriodYear, untilPeriodMonth }) =>
      bindersApi.markReadyForHandoverBulk({
        client_record_id: clientId,
        until_period_year: untilPeriodYear,
        until_period_month: untilPeriodMonth,
      }),
    successMessage: (response) =>
      response.length > 0
        ? BINDERS_MESSAGES.mutations.bulkReadySuccess(response.length)
        : BINDERS_ERROR_MESSAGES.mutations.bulkReadyEmpty,
    errorMessage: BINDERS_ERROR_MESSAGES.mutations.bulkReadyError,
    invalidateKeys: [bindersQK.all],
  })

  const revertReadyForHandoverMutation = useMutationWithToast<
    Awaited<ReturnType<typeof bindersApi.revertReadyForHandover>>,
    number
  >({
    mutationFn: (binderId) => bindersApi.revertReadyForHandover(binderId),
    successMessage: BINDERS_MESSAGES.mutations.revertReadySuccess,
    errorMessage: BINDERS_ERROR_MESSAGES.mutations.revertReadyError,
    invalidateKeys: [bindersQK.all],
  })

  const handoverToClientMutation = useMutationWithToast<
    Awaited<ReturnType<typeof bindersApi.handoverToClient>>,
    { binderId: number; handoverRecipientName: string }
  >({
    mutationFn: ({ binderId, handoverRecipientName }) =>
      bindersApi.handoverToClient(binderId, { handover_recipient_name: handoverRecipientName }),
    successMessage: BINDERS_MESSAGES.mutations.handoverSuccess,
    errorMessage: BINDERS_ERROR_MESSAGES.mutations.handoverError,
    invalidateKeys: [bindersQK.all],
  })

  const handoverToClientBulkMutation = useMutationWithToast<
    Awaited<ReturnType<typeof bindersApi.handoverToClientBulk>>,
    {
      clientId: number
      binderIds: number[]
      receivedByName: string
      handedOverAt: string
      untilPeriodYear: number
      untilPeriodMonth: number
      notes?: string | null
    }
  >({
    mutationFn: (payload) =>
      bindersApi.handoverToClientBulk({
        client_record_id: payload.clientId,
        binder_ids: payload.binderIds,
        received_by_name: payload.receivedByName,
        handed_over_at: payload.handedOverAt,
        until_period_year: payload.untilPeriodYear,
        until_period_month: payload.untilPeriodMonth,
        notes: payload.notes ?? null,
      }),
    successMessage: (handover) => BINDERS_MESSAGES.mutations.bulkHandoverSuccess(handover.binder_ids.length),
    errorMessage: BINDERS_ERROR_MESSAGES.mutations.bulkHandoverError,
    invalidateKeys: [bindersQK.all],
  })

  const actionLoadingId = receiveMaterialMutation.isPending
    ? ((receiveMaterialMutation.variables as number | undefined) ?? null)
    : markFullMutation.isPending
      ? ((markFullMutation.variables as number | undefined) ?? null)
      : reopenCapacityMutation.isPending
        ? ((reopenCapacityMutation.variables as number | undefined) ?? null)
        : markReadyForHandoverMutation.isPending
          ? ((markReadyForHandoverMutation.variables as number | undefined) ?? null)
          : revertReadyForHandoverMutation.isPending
            ? ((revertReadyForHandoverMutation.variables as number | undefined) ?? null)
            : handoverToClientMutation.isPending
              ? ((handoverToClientMutation.variables as { binderId: number } | undefined)?.binderId ?? null)
              : null

  return {
    actionLoadingId,
    deleteBinder: (binderId: number) => deleteMutation.mutateAsync(binderId),
    isDeleting: deleteMutation.isPending,
    receiveMaterial: (binderId: number) => receiveMaterialMutation.mutateAsync(binderId),
    markFull: (binderId: number) => markFullMutation.mutateAsync(binderId),
    reopenCapacity: (binderId: number) => reopenCapacityMutation.mutateAsync(binderId),
    markReadyForHandover: (binderId: number) => markReadyForHandoverMutation.mutateAsync(binderId),
    isMarkingReadyForHandover: markReadyForHandoverMutation.isPending,
    markReadyForHandoverBulk: (clientId: number, untilPeriodYear: number, untilPeriodMonth: number) =>
      markReadyForHandoverBulkMutation.mutateAsync({ clientId, untilPeriodYear, untilPeriodMonth }),
    isMarkingReadyForHandoverBulk: markReadyForHandoverBulkMutation.isPending,
    revertReadyForHandover: (binderId: number) => revertReadyForHandoverMutation.mutateAsync(binderId),
    handoverToClient: (binderId: number, handoverRecipientName: string) =>
      handoverToClientMutation.mutateAsync({ binderId, handoverRecipientName }),
    isHandingOverToClient: handoverToClientMutation.isPending,
    handoverToClientBulk: (
      clientId: number,
      binderIds: number[],
      receivedByName: string,
      handedOverAt: string,
      untilPeriodYear: number,
      untilPeriodMonth: number,
      notes?: string | null,
    ) =>
      handoverToClientBulkMutation.mutateAsync({
        clientId,
        binderIds,
        receivedByName,
        handedOverAt,
        untilPeriodYear,
        untilPeriodMonth,
        notes,
      }),
    isHandingOverToClientBulk: handoverToClientBulkMutation.isPending,
  }
}
