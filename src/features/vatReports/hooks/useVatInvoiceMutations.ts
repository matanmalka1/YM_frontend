import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { vatReportsApi, type CreateVatInvoicePayload, type UpdateVatInvoicePayload } from '../api'
import { showErrorToast } from '../../../utils/utils'
import { toast } from '../../../utils/toast'
import { invalidateVatWorkItem } from './useVatInvalidation'
import { VAT_MESSAGES } from '../messages'
import { VAT_ERROR_MESSAGES } from '../errorMessages'

const invalidateVatInvoiceQueries = async (queryClient: QueryClient, workItemId: number) => {
  await invalidateVatWorkItem(queryClient, {
    workItemId,
    includeInvoices: true,
  })
}

const runMutationWithFeedback = async (
  action: () => Promise<unknown>,
  successMessage: string,
  errorMessage: string,
): Promise<boolean> => {
  try {
    await action()
    toast.success(successMessage)
    return true
  } catch (err) {
    showErrorToast(err, errorMessage)
    return false
  }
}

export const useAddInvoice = (workItemId: number) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload: CreateVatInvoicePayload) => vatReportsApi.addInvoice(workItemId, payload),
    onSuccess: async () => invalidateVatInvoiceQueries(queryClient, workItemId),
  })

  const addInvoice = async (payload: CreateVatInvoicePayload): Promise<boolean> =>
    runMutationWithFeedback(
      () => mutation.mutateAsync(payload),
      VAT_MESSAGES.mutations.invoiceAdded,
      VAT_ERROR_MESSAGES.mutations.invoiceAddError,
    )

  return { addInvoice, isAdding: mutation.isPending }
}

export const useDeleteInvoice = (workItemId: number) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (invoiceId: number) => vatReportsApi.deleteInvoice(workItemId, invoiceId),
    onSuccess: async () => invalidateVatInvoiceQueries(queryClient, workItemId),
  })

  const deleteInvoice = async (invoiceId: number): Promise<boolean> =>
    runMutationWithFeedback(
      () => mutation.mutateAsync(invoiceId),
      VAT_MESSAGES.mutations.invoiceDeleted,
      VAT_ERROR_MESSAGES.mutations.invoiceDeleteError,
    )

  return { deleteInvoice, isDeleting: mutation.isPending }
}

export const useDeleteWorkItem = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (workItemId: number) => vatReportsApi.deleteWorkItem(workItemId),
    onSuccess: async (_, workItemId) => invalidateVatWorkItem(queryClient, { workItemId }),
  })

  const deleteWorkItem = async (workItemId: number): Promise<boolean> =>
    runMutationWithFeedback(
      () => mutation.mutateAsync(workItemId),
      VAT_MESSAGES.mutations.workItemDeleted,
      VAT_ERROR_MESSAGES.mutations.workItemDeleteError,
    )

  return { deleteWorkItem, isDeleting: mutation.isPending }
}

export const useUpdateInvoice = (workItemId: number) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ invoiceId, payload }: { invoiceId: number; payload: UpdateVatInvoicePayload }) =>
      vatReportsApi.updateInvoice(workItemId, invoiceId, payload),
    onSuccess: async () => invalidateVatInvoiceQueries(queryClient, workItemId),
  })

  const updateInvoice = async (invoiceId: number, payload: UpdateVatInvoicePayload): Promise<boolean> =>
    runMutationWithFeedback(
      () => mutation.mutateAsync({ invoiceId, payload }),
      VAT_MESSAGES.mutations.invoiceUpdated,
      VAT_ERROR_MESSAGES.mutations.invoiceUpdateError,
    )

  return { updateInvoice, isUpdating: mutation.isPending }
}
