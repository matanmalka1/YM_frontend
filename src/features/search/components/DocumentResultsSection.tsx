import { GLOBAL_UI_MESSAGES } from '@/messages'
import { FileText, ExternalLink } from 'lucide-react'
import { Input } from '../../../components/ui/inputs/Input'
import {
  actionsColumn,
  DataTable,
  monoColumn,
  numberColumn,
  RowActionLink,
  RowActionsMenu,
  textColumn,
  type Column,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/primitives/Badge'
import { DOC_TYPE_LABELS } from '@/features/documents'
import type { DocumentSearchResult } from '../api'
import type { SearchFilters } from '../types'
import { formatClientOfficeId } from '../../../utils/utils'
import { DOCUMENT_FILENAME_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'
import { SEARCH_MESSAGES } from '../messages'

const DOCUMENT_SEARCH_LIMIT = 50

const DOCUMENT_COLUMNS: Column<DocumentSearchResult>[] = [
  monoColumn({
    key: 'office',
    header: SEARCH_MESSAGES.columns.officeNumber,
    getValue: (doc) => formatClientOfficeId(doc.office_client_number),
  }),
  textColumn({
    key: 'client',
    header: GLOBAL_UI_MESSAGES.common.client,
    tone: 'strong',
    getValue: (doc) => doc.client_name,
  }),
  textColumn({
    key: 'type',
    header: SEARCH_MESSAGES.documents.type,
    getValue: (doc) => DOC_TYPE_LABELS[doc.document_type] ?? SEARCH_MESSAGES.documents.unknownType,
  }),
  monoColumn({
    key: 'filename',
    header: SEARCH_MESSAGES.filters.filename,
    truncate: true,
    getValue: (doc) => doc.original_filename,
  }),
  numberColumn({
    key: 'taxYear',
    header: SEARCH_MESSAGES.documents.taxYear,
    getValue: (doc) => doc.tax_year,
  }),
  actionsColumn({
    key: 'action',
    header: '',
    render: (doc) => (
      <RowActionsMenu ariaLabel={SEARCH_MESSAGES.actions.details}>
        <RowActionLink
          href={`/clients/${doc.client_record_id}/documents`}
          label={SEARCH_MESSAGES.actions.details}
          icon={<ExternalLink className="h-3 w-3" />}
        />
      </RowActionsMenu>
    ),
  }),
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
