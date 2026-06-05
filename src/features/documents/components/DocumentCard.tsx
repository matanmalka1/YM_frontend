import { Calendar, Download, Eye, FileText, History, RefreshCw, Trash2 } from 'lucide-react'
import { Badge } from '../../../components/ui/primitives/Badge'
import { Button } from '../../../components/ui/primitives/Button'
import { RowActionsMenu, RowActionItem, RowActionSeparator } from '@/components/ui/table'
import { formatDate } from '../../../utils/utils'
import { DOC_TYPE_LABELS } from '../documents.constants'
import type { PermanentDocumentResponse } from '../api'

interface DocumentCardProps {
  doc: PermanentDocumentResponse
  isAdvisor: boolean
  downloadingId: number | null
  replacingId: number | null
  deletingId: number | null
  onPreview: (doc: PermanentDocumentResponse) => void
  onDownload: (doc: PermanentDocumentResponse) => void
  onReplace: (id: number) => void
  onDelete: (id: number) => void
  onToggleVersions: (id: number) => void
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  isAdvisor,
  downloadingId,
  replacingId,
  deletingId,
  onPreview,
  onDownload,
  onReplace,
  onDelete,
  onToggleVersions,
}) => (
  <div className="flex flex-col gap-3 rounded-xl border border-gray-200/80 bg-white p-4 transition-all duration-200 hover:shadow-md animate-fade-in">
    <div className="flex items-start justify-between gap-2">
      <span className="text-sm font-semibold text-gray-900 leading-snug">
        {DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}
      </span>
      <RowActionsMenu ariaLabel={`פעולות נוספות למסמך ${doc.id}`} title="פעולות נוספות">
        <RowActionItem
          label="היסטוריית גרסאות"
          onClick={() => onToggleVersions(doc.id)}
          icon={<History className="h-4 w-4" />}
        />
        {isAdvisor && (
          <>
            <RowActionSeparator />
            <RowActionItem
              label={replacingId === doc.id ? 'מחליף...' : 'החלף קובץ'}
              onClick={() => onReplace(doc.id)}
              icon={<RefreshCw className="h-4 w-4" />}
              disabled={replacingId === doc.id}
            />
            <RowActionItem
              label={deletingId === doc.id ? 'מוחק...' : 'מחק'}
              onClick={() => onDelete(doc.id)}
              icon={<Trash2 className="h-4 w-4" />}
              danger
              disabled={deletingId === doc.id}
            />
          </>
        )}
      </RowActionsMenu>
    </div>

    <button
      type="button"
      onClick={() => onPreview(doc)}
      className="flex items-center gap-1.5 text-right text-xs font-mono text-primary-700 hover:underline truncate"
      title={doc.original_filename ?? undefined}
    >
      <FileText className="h-3.5 w-3.5 shrink-0 text-gray-400" />
      <span className="truncate">{doc.original_filename ?? '—'}</span>
    </button>

    <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
      {doc.tax_year ? (
        <Badge variant="info">{doc.tax_year}</Badge>
      ) : (
        <span className="text-xs text-gray-400">ללא שנת מס</span>
      )}
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Calendar className="h-3 w-3 shrink-0" />
        <span>{formatDate(doc.uploaded_at)}</span>
      </div>
    </div>

    <div className="flex items-center gap-2 border-t border-gray-100 pt-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPreview(doc)}
        className="flex-1 gap-1.5"
        aria-label="צפייה במסמך"
      >
        <Eye className="h-3.5 w-3.5" />
        צפייה
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        isLoading={downloadingId === doc.id}
        onClick={() => onDownload(doc)}
        className="flex-1 gap-1.5"
        aria-label="הורדת מסמך"
      >
        <Download className="h-3.5 w-3.5" />
        הורדה
      </Button>
    </div>
  </div>
)

DocumentCard.displayName = 'DocumentCard'
