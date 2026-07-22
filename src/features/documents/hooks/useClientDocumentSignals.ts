import { useQuery } from '@tanstack/react-query'
import { getErrorMessage } from '@/utils/utils'
import { documentsApi, documentsQK } from '../api'
import { DOC_TYPE_LABELS } from '../constants'
import { DOCUMENTS_ERROR_MESSAGES } from '../errorMessages'

export const useClientDocumentSignals = (clientId: number | null, enabled: boolean) => {
  const query = useQuery({
    queryKey: documentsQK.clientSignals(clientId ?? 0),
    queryFn: () => documentsApi.getSignalsByClient(clientId as number),
    enabled: enabled && clientId !== null && clientId > 0,
    retry: 1,
  })
  const missingDocuments = query.data?.missing_documents ?? []

  return {
    missingDocuments,
    labels: missingDocuments.map((documentType) => DOC_TYPE_LABELS[documentType] ?? documentType),
    isLoading: query.isPending && query.isEnabled,
    error: query.error ? getErrorMessage(query.error, DOCUMENTS_ERROR_MESSAGES.load) : null,
  }
}
