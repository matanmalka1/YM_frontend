import { DOC_TYPE_LABELS } from '../constants'
import type { PermanentDocumentResponse } from '../api'
import type { BusinessResponse } from '@/features/clients'
import { GENERAL_CLIENT_DOCUMENT_LABEL } from '../constants'

const getDocumentTypeLabel = (documentType: PermanentDocumentResponse['document_type'] | string) =>
  DOC_TYPE_LABELS[documentType] ?? documentType

const matchesDocumentSearch = (doc: PermanentDocumentResponse, searchTerm: string) => {
  if (!searchTerm) return true
  const query = searchTerm.toLowerCase()
  const filename = (doc.original_filename ?? '').toLowerCase()
  const documentType = getDocumentTypeLabel(doc.document_type).toLowerCase()

  return filename.includes(query) || documentType.includes(query)
}

export const filterDocuments = (documents: PermanentDocumentResponse[], searchTerm: string, documentType: string) =>
  documents.filter((doc) => {
    if (documentType && doc.document_type !== documentType) return false
    return matchesDocumentSearch(doc, searchTerm)
  })

export const getCountLabel = (filteredCount: number, totalCount: number) =>
  filteredCount !== totalCount ? `${filteredCount}/${totalCount}` : `${totalCount}`

export const getBusinessOptions = (businesses: BusinessResponse[]) => [
  { value: '', label: GENERAL_CLIENT_DOCUMENT_LABEL },
  ...businesses.map((business) => ({
    value: String(business.id),
    label: business.business_name ?? `עסק #${business.id}`,
  })),
]
