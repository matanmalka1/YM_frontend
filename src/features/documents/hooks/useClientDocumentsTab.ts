import { useQuery, useQueryClient } from '@tanstack/react-query'
import { documentsApi, documentsQK, type OperationalSignalsResponse, type PermanentDocumentListResponse } from '../api'
import { useBusinessesForClient } from '@/hooks/useBusinessesForClient'
import { getErrorMessage } from '../../../utils/utils'
import { useDocumentUpload } from './useDocumentUpload'
import { toast } from '../../../utils/toast'

export const useClientDocumentsTab = (clientId: number, taxYear?: number | null) => {
  const queryClient = useQueryClient()
  const { businesses, isLoading: businessesLoading } = useBusinessesForClient({ clientId })

  const documentsQuery = useQuery<PermanentDocumentListResponse>({
    enabled: clientId > 0,
    queryKey: [...documentsQK.clientList(clientId), taxYear ?? null],
    queryFn: () => documentsApi.listByClient(clientId, taxYear ? { tax_year: taxYear } : undefined),
  })

  const signalsQuery = useQuery<OperationalSignalsResponse>({
    enabled: clientId > 0,
    queryKey: documentsQK.clientSignals(clientId),
    queryFn: () => documentsApi.getSignalsByClient(clientId),
  })

  const { submitUpload, uploadError, uploading } = useDocumentUpload()

  const invalidateDocs = () => {
    void queryClient.invalidateQueries({ queryKey: documentsQK.clientList(clientId) })
    void queryClient.invalidateQueries({ queryKey: documentsQK.clientSignals(clientId) })
  }

  const handleDelete = async (id: number) => {
    await documentsApi.deleteDocument(clientId, id)
    toast.success('מסמך נמחק')
    invalidateDocs()
  }

  const handleReplace = async (id: number, file: File) => {
    await documentsApi.replaceDocument(clientId, id, file)
    toast.success('מסמך הוחלף')
    invalidateDocs()
  }

  const errorSource = documentsQuery.error ?? signalsQuery.error

  return {
    documents: documentsQuery.data?.items ?? [],
    signals: signalsQuery.data ?? { client_record_id: clientId, missing_documents: [] },
    loading: documentsQuery.isPending || signalsQuery.isPending,
    error: errorSource ? getErrorMessage(errorSource, 'שגיאה בטעינת מסמכים') : null,
    businesses,
    businessesLoading,
    submitUpload: (payload: {
      document_type: Parameters<typeof submitUpload>[0]['document_type']
      business_id?: number | null
      file: File
      tax_year?: number | null
      annual_report_id?: number | null
    }) => submitUpload({ ...payload, client_record_id: clientId }),
    uploadError,
    uploading,
    handleDelete,
    handleReplace,
  }
}
