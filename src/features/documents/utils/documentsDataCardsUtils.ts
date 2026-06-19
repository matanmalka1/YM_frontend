import { DOC_TYPE_LABELS } from '../constants'
import type { PermanentDocumentResponse } from '../api'
import type { BusinessResponse } from '@/features/clients'
import type { FilterBadge } from '../../../components/ui/table/ActiveFilterBadges'
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

interface DocumentFilterBadgesParams {
  search: string
  filterType: string
  taxYear: number | null
  onSearchChange: (search: string) => void
  onFilterTypeChange: (documentType: string) => void
  onTaxYearChange: (year: number | null) => void
}

export const getDocumentFilterBadges = ({
  search,
  filterType,
  taxYear,
  onSearchChange,
  onFilterTypeChange,
  onTaxYearChange,
}: DocumentFilterBadgesParams): FilterBadge[] =>
  [
    search
      ? {
          key: 'search',
          label: `חיפוש: ${search}`,
          onRemove: () => onSearchChange(''),
        }
      : null,
    filterType
      ? {
          key: 'filterType',
          label: getDocumentTypeLabel(filterType),
          onRemove: () => onFilterTypeChange(''),
        }
      : null,
    taxYear
      ? {
          key: 'taxYear',
          label: `שנה: ${taxYear}`,
          onRemove: () => onTaxYearChange(null),
        }
      : null,
  ].filter((badge): badge is FilterBadge => badge !== null)
