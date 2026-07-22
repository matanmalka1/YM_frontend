import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateVatWorkItemPayload, VatWorkItemListItem } from '../api'
import { vatReportsApi } from '../api'
import type { VatWorkItemAction } from '../types'
import { useRole } from '@/hooks/useRole'
import { useDeleteWorkItem } from './useVatInvoiceMutations'
import { invalidateVatWorkItem } from './useVatInvalidation'
import { isFiled } from '../utils/vatHelpers'
import { buildVatWorkItemColumns } from '../components/list/VatWorkItemColumns'
import { getErrorMessage, showErrorToast } from '@/utils/utils'
import { toast } from '@/utils/toast'
import { VAT_MESSAGES } from '../messages'
import { VAT_ERROR_MESSAGES } from '../errorMessages'

export const useVatWorkItemListActions = () => {
  const queryClient = useQueryClient()
  const { isAdvisor, isSecretary, can } = useRole()
  const { deleteWorkItem, isDeleting } = useDeleteWorkItem()
  const [deleteTarget, setDeleteTarget] = useState<VatWorkItemListItem | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)

  const createMutation = useMutation({
    mutationFn: (payload: CreateVatWorkItemPayload) => vatReportsApi.create(payload),
    onSuccess: async (workItem) => {
      toast.success(VAT_MESSAGES.mutations.createWorkItemSuccess)
      await invalidateVatWorkItem(queryClient, {
        workItemId: workItem.id,
        clientRecordId: workItem.client_record_id,
        includeAudit: false,
      })
    },
  })

  const actionMutation = useMutation({
    mutationFn: ({ action, itemId }: { action: Exclude<VatWorkItemAction, 'sendBack'>; itemId: number }) =>
      action === 'materialsComplete' ? vatReportsApi.markMaterialsComplete(itemId) : vatReportsApi.markReadyForReview(itemId),
    onSuccess: async (workItem) => {
      toast.success(VAT_MESSAGES.mutations.genericActionSuccess)
      await invalidateVatWorkItem(queryClient, {
        workItemId: workItem.id,
        clientRecordId: workItem.client_record_id,
      })
    },
  })

  const sendBackMutation = useMutation({
    mutationFn: ({ itemId, note }: { itemId: number; note: string }) => vatReportsApi.sendBack(itemId, note),
    onSuccess: async (workItem) => {
      toast.success(VAT_MESSAGES.mutations.sendBackSuccess)
      await invalidateVatWorkItem(queryClient, {
        workItemId: workItem.id,
        clientRecordId: workItem.client_record_id,
      })
    },
  })

  const runAction = useCallback(
    async (itemId: number, action: VatWorkItemAction) => {
      if (action === 'sendBack') return
      try {
        setActionLoadingId(itemId)
        await actionMutation.mutateAsync({ action, itemId })
      } catch (error: unknown) {
        showErrorToast(error, VAT_ERROR_MESSAGES.page.actionError)
      } finally {
        setActionLoadingId(null)
      }
    },
    [actionMutation],
  )

  const sendBackWithNote = useCallback(
    async (itemId: number, note: string) => {
      if (!isAdvisor) {
        toast.error(VAT_ERROR_MESSAGES.page.actionAdvisorOnly)
        return
      }
      try {
        setActionLoadingId(itemId)
        await sendBackMutation.mutateAsync({ itemId, note })
      } catch (error: unknown) {
        showErrorToast(error, VAT_ERROR_MESSAGES.page.sendBackError)
      } finally {
        setActionLoadingId(null)
      }
    },
    [isAdvisor, sendBackMutation],
  )

  const canDeleteWorkItem = useCallback(
    (item: VatWorkItemListItem) => (isAdvisor || isSecretary) && !isFiled(item.status),
    [isAdvisor, isSecretary],
  )

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    if (await deleteWorkItem(deleteTarget.id)) setDeleteTarget(null)
  }, [deleteTarget, deleteWorkItem])

  const columns = useMemo(
    () =>
      buildVatWorkItemColumns({
        isLoading: false,
        isDisabled: actionLoadingId !== null,
        runAction,
        canDeleteWorkItem,
        isDeleting,
        onDeleteRequest: setDeleteTarget,
      }),
    [actionLoadingId, canDeleteWorkItem, isDeleting, runAction],
  )

  return {
    columns,
    sendBackWithNote,
    permissions: { isAdvisor, canCreateVatWorkItem: can.createVatWorkItems, canDeleteWorkItem },
    create: {
      submit: async (payload: CreateVatWorkItemPayload) => {
        if (!can.createVatWorkItems) return false
        try {
          await createMutation.mutateAsync(payload)
          return true
        } catch (error: unknown) {
          showErrorToast(error, VAT_ERROR_MESSAGES.page.createWorkItemError)
          return false
        }
      },
      isLoading: createMutation.isPending,
      error: createMutation.error ? getErrorMessage(createMutation.error, VAT_ERROR_MESSAGES.page.createWorkItemError) : null,
    },
    deletion: {
      open: deleteTarget !== null,
      isLoading: isDeleting,
      confirm: confirmDelete,
      cancel: useCallback(() => setDeleteTarget(null), []),
    },
  }
}
