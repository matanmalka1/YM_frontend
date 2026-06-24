import { FileText, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Input } from '../../../components/ui/inputs/Input'
import { DataTable, type Column } from '@/components/ui/table/DataTable'
import { Badge } from '@/components/ui/primitives/Badge'
import { DOC_TYPE_LABELS } from '@/features/documents'
import type { DocumentSearchResult } from '../api'
import type { SearchFilters } from '../types'
import { cn, formatClientOfficeId } from '../../../utils/utils'
import { DOCUMENT_FILENAME_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'
import { SEARCH_MESSAGES } from '../messages'

const DOCUMENT_SEARCH_LIMIT = 50

const DOCUMENT_COLUMNS: Column<DocumentSearchResult>[] = [
  {
    key: 'office',
    header: SEARCH_MESSAGES.columns.officeNumber,
    align: 'right',
    render: (doc) => (
      <span className="font-mono text-sm text-gray-500 tabular-nums">
        {formatClientOfficeId(doc.office_client_number)}
      </span>
    ),
  },
  {
    key: 'client',
    header: SEARCH_MESSAGES.columns.client,
    align: 'right',
    render: (doc) => <span className="text-gray-700">{doc.client_name}</span>,
  },
  {
    key: 'type',
    header: SEARCH_MESSAGES.documents.type,
    align: 'right',
    render: (doc) => (
      <span className="font-medium text-gray-800">
        {DOC_TYPE_LABELS[doc.document_type] ?? SEARCH_MESSAGES.documents.unknownType}
      </span>
    ),
  },
  {
    key: 'filename',
    header: SEARCH_MESSAGES.filters.filename,
    align: 'right',
    className: 'max-w-xs truncate',
    render: (doc) => (
      <span className="font-mono text-xs text-gray-600">
        {doc.original_filename ?? <span className="text-gray-300">—</span>}
      </span>
    ),
  },
  {
    key: 'taxYear',
    header: SEARCH_MESSAGES.documents.taxYear,
    align: 'right',
    render: (doc) => <span className="text-gray-600">{doc.tax_year ?? <span className="text-gray-300">—</span>}</span>,
  },
  {
    key: 'action',
    header: '',
    align: 'right',
    render: (doc) => (
      <Link
        to={`/clients/${doc.client_record_id}/documents`}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg',
          'border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium',
          'text-gray-600 shadow-sm transition-all duration-200',
          'hover:border-purple-400 hover:bg-purple-50 hover:text-purple-800 hover:shadow-md',
        )}
      >
        <ExternalLink className="h-3 w-3" />
        {SEARCH_MESSAGES.actions.details}
      </Link>
    ),
  },
]

interface DocumentResultsSectionProps {
  documents: DocumentSearchResult[]
  filenameFilter: string
  onFilenameChange: (name: keyof SearchFilters, value: string) => void
}

export const DocumentResultsSection: React.FC<DocumentResultsSectionProps> = ({
  documents,
  filenameFilter,
  onFilenameChange,
}) => {
  if (documents.length === 0 && !filenameFilter) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 px-1">
        <FileText className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-semibold text-gray-800">{SEARCH_MESSAGES.documents.title}</span>
        {documents.length > 0 && (
          <Badge variant="purple" size="xs">
            {documents.length}
          </Badge>
        )}
        {documents.length >= DOCUMENT_SEARCH_LIMIT && (
          <span className="text-xs text-gray-400">
            {SEARCH_MESSAGES.documents.displayedFirst(DOCUMENT_SEARCH_LIMIT)}
          </span>
        )}
        <div className="mr-auto w-56">
          <Input
            type="text"
            value={filenameFilter}
            onChange={(e) => onFilenameChange('filename', e.target.value)}
            placeholder={DOCUMENT_FILENAME_SEARCH_PLACEHOLDER}
          />
        </div>
      </div>

      <DataTable
        data={documents}
        columns={DOCUMENT_COLUMNS}
        getRowKey={(doc) => doc.id}
        emptyMessage={SEARCH_MESSAGES.documents.empty}
      />
    </div>
  )
}
