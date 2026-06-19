import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { vatReportsApi } from '../api'
import { vatReportsQK } from '../api/queryKeys'
import { toast } from '@/utils/toast'
import { showErrorToast } from '@/utils/utils'
import { invalidateVatWorkItem } from './useVatInvalidation'
import { VAT_FILE_MODAL_MESSAGES } from '../constants/vatConstants'
import type { FileVatReturnPayload } from '../api'

export const useFileVatReturn = (workItemId: number) => {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const fileVatReturn = async (payload: FileVatReturnPayload): Promise<boolean> => {
    setIsLoading(true)
    try {
      const workItem = await vatReportsApi.fileVatReturn(workItemId, payload)
      toast.success(VAT_FILE_MODAL_MESSAGES.filingSuccess)
      queryClient.setQueryData(vatReportsQK.detail(workItemId), (prev: unknown) => {
        if (!prev || typeof prev !== 'object') return prev
        return { ...(prev as object), status: 'filed' }
      })
      await invalidateVatWorkItem(queryClient, {
        workItemId,
        clientRecordId: workItem.client_record_id,
        includeAudit: true,
      })
      return true
    } catch (err) {
      showErrorToast(err, VAT_FILE_MODAL_MESSAGES.filingError)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { fileVatReturn, isLoading }
}
