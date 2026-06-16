import { FileText, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Input } from '../../../components/ui/inputs/Input'
import { DataTable, type Column } from '@/components/ui/table/DataTable'
import { DOC_TYPE_LABELS } from '@/features/documents'
import type { DocumentSearchResult } from '../api'
import type { SearchFilters } from '../types'
import { cn, formatClientOfficeId } from '../../../utils/utils'

const DOCUMENT_SEARCH_LIMIT = 50

const DOCUMENT_COLUMNS: Column<DocumentSearchResult>[] = [
  {
    key: 'office',
    header: "מס' לקוח",
    align: 'right',
    render: (doc) => (
      <span className="font-mono text-sm text-gray-500 tabular-nums">
        {formatClientOfficeId(doc.office_client_number)}
      </span>
    ),
  },
  { key: 'client', header: 'לקוח', align: 'right', render: (doc) => <span className="text-gray-700">{doc.client_name}</span> },
  {
    key: 'type',
    header: 'סוג מסמך',
    align: 'right',
    render: (doc) => (
      <span className="font-medium text-gray-800">{DOC_TYPE_LABELS[doc.document_type] ?? 'סוג מסמך לא ידוע'}</span>
    ),
  },
  {
    key: 'filename',
    header: 'שם קובץ',
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
    header: 'שנת מס',
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
        פירוט
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
        <span className="text-sm font-semibold text-gray-800">מסמכים</span>
        {documents.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-100 px-1.5 text-xs font-semibold text-purple-700">
            {documents.length}
          </span>
        )}
        {documents.length >= DOCUMENT_SEARCH_LIMIT && (
          <span className="text-xs text-gray-400">מוצגים {DOCUMENT_SEARCH_LIMIT} ראשונים</span>
        )}
        <div className="mr-auto w-56">
          <Input
            type="text"
            value={filenameFilter}
            onChange={(e) => onFilenameChange('filename', e.target.value)}
            placeholder="חיפוש לפי שם קובץ..."
          />
        </div>
      </div>

      <DataTable
        data={documents}
        columns={DOCUMENT_COLUMNS}
        getRowKey={(doc) => doc.id}
        emptyMessage="לא נמצאו מסמכים"
      />
    </div>
  )
}
