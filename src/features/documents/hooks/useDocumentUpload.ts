import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsApi, documentsQK, type UploadDocumentPayload } from '../api'
import { getErrorMessage } from '../../../utils/utils'
import { toast } from '../../../utils/toast'
import { DOCUMENTS_ERROR_MESSAGES } from '../errorMessages'

export const useDocumentUpload = () => {
  const queryClient = useQueryClient()
  const [uploadError, setUploadError] = useState<string | null>(null)

  const uploadMutation = useMutation({
    mutationFn: (payload: UploadDocumentPayload) => documentsApi.upload(payload),
    onSuccess: async (_, variables) => {
      setUploadError(null)
      toast.success('מסמך הועלה בהצלחה')
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: documentsQK.clientList(variables.client_record_id),
        }),
        queryClient.invalidateQueries({
          queryKey: documentsQK.clientSignals(variables.client_record_id),
        }),
      ])
    },
  })

  const submitUpload = async (
    payload: Pick<UploadDocumentPayload, 'client_record_id' | 'document_type' | 'file'> & {
      business_id?: number | null
      tax_year?: number | null
      annual_report_id?: number | null
    },
  ): Promise<boolean> => {
    try {
      await uploadMutation.mutateAsync(payload)
      return true
    } catch (err: unknown) {
      setUploadError(getErrorMessage(err, DOCUMENTS_ERROR_MESSAGES.upload))
      return false
    }
  }

  return {
    submitUpload,
    uploadError,
    uploading: uploadMutation.isPending,
  }
}
