import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { documentsApi, documentsQK, type PermanentDocumentListResponse, type UpdateDocumentPayload } from '../api'
import { useBusinessesForClient } from '@/features/clients/public'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { parsePositiveInt } from '@/utils/utils'
import { getErrorMessage } from '../../../utils/utils'
import { getTotalPages } from '@/utils/paginationUtils'
import { useDocumentUpload } from './useDocumentUpload'
import { toast } from '../../../utils/toast'
import { DOCUMENTS_MESSAGES } from '../messages'
import { PAGE_SIZE_SM as PAGE_SIZE } from '@/constants/pagination.constants'
import { DOCUMENTS_ERROR_MESSAGES } from '../errorMessages'

export const useClientDocumentsTab = (clientId: number, taxYear?: number | null) => {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const { searchParams } = useSearchParamFilters()

  // `document_id` opens one document straight from a deep link (search results, shared
  // links). It is loaded on its own so it is reachable even when the current tax-year
  // filter or page would not have listed it.
  const focusedDocumentId = parsePositiveInt(searchParams.get('document_id'), 0) || null
  const { data: focusedDocument } = useQuery({
    enabled: clientId > 0 && focusedDocumentId !== null,
    queryKey: documentsQK.clientDetail(clientId, focusedDocumentId ?? 0),
    queryFn: () => documentsApi.getById(clientId, focusedDocumentId as number),
  })
  const { businesses, isLoading: businessesLoading } = useBusinessesForClient({ clientId })

  const {
    data: documentsData,
    isPending: documentsPending,
    error: documentsError,
  } = useQuery<PermanentDocumentListResponse>({
    enabled: clientId > 0,
    queryKey: [...documentsQK.clientList(clientId), taxYear ?? null, page, PAGE_SIZE],
    queryFn: () =>
      documentsApi.listByClient(clientId, {
        ...(taxYear ? { tax_year: taxYear } : {}),
        page,
        page_size: PAGE_SIZE,
      }),
  })

  const { submitUpload, uploadError, uploading } = useDocumentUpload()

  const invalidateDocs = () => {
    void queryClient.invalidateQueries({ queryKey: documentsQK.clientList(clientId) })
    void queryClient.invalidateQueries({ queryKey: documentsQK.clientSignals(clientId) })
    void queryClient.invalidateQueries({ queryKey: documentsQK.binderRoot })
  }

  const handleDelete = async (id: number) => {
    await documentsApi.deleteDocument(clientId, id)
    toast.success(DOCUMENTS_MESSAGES.success.deleted)
    invalidateDocs()
  }

  const handleReplace = async (id: number, file: File) => {
    await documentsApi.replaceDocument(clientId, id, file)
    toast.success(DOCUMENTS_MESSAGES.success.replaced)
    invalidateDocs()
  }

  const handleUpdate = async (id: number, payload: UpdateDocumentPayload) => {
    await documentsApi.updateDocument(clientId, id, payload)
    toast.success(DOCUMENTS_MESSAGES.success.updated)
    invalidateDocs()
  }

  const total = documentsData?.total ?? 0
  const totalPages = getTotalPages(total, PAGE_SIZE)

  // A deep-linked document is pinned to the top when this page would not have shown it.
  const listed = documentsData?.items ?? []
  const documents =
    focusedDocument && !listed.some((doc) => doc.id === focusedDocument.id) ? [focusedDocument, ...listed] : listed

  return {
    documents,
    focusedDocumentId,
    loading: documentsPending,
    error: documentsError ? getErrorMessage(documentsError, DOCUMENTS_ERROR_MESSAGES.load) : null,
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
    handleUpdate,
    page,
    setPage,
    totalPages,
    total,
  }
}
