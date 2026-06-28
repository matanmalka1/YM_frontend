import { Calendar, Download, Eye, FileText, History, Pencil, RefreshCw, Trash2 } from 'lucide-react'
import { Badge } from '../../../../components/ui/primitives/Badge'
import { Button } from '../../../../components/ui/primitives/Button'
import { Card } from '../../../../components/ui/primitives/Card'
import { RowActionGroup, RowActionsMenu, RowActionItem } from '@/components/ui/table'
import { formatDate } from '../../../../utils/utils'
import { DOC_TYPE_LABELS } from '../../constants'
import type { PermanentDocumentResponse } from '../../api'
import { DOCUMENTS_MESSAGES } from '../../messages'

interface DocumentCardProps {
  doc: PermanentDocumentResponse
  isAdvisor: boolean
  canEditReplace: boolean
  downloadingId: number | null
  replacingId: number | null
  deletingId: number | null
  onPreview: (doc: PermanentDocumentResponse) => void
  onDownload: (doc: PermanentDocumentResponse) => void
  onReplace: (id: number) => void
  onDelete: (id: number) => void
  onToggleVersions: (id: number) => void
  onEdit: (doc: PermanentDocumentResponse) => void
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  isAdvisor,
  canEditReplace,
  downloadingId,
  replacingId,
  deletingId,
  onPreview,
  onDownload,
  onReplace,
  onDelete,
  onToggleVersions,
  onEdit,
}) => (
  <Card size="compact" bodyClassName="flex flex-col gap-2 text-xs">
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs font-semibold text-gray-900 leading-snug">
        {DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}
      </span>
      <RowActionsMenu
        ariaLabel={DOCUMENTS_MESSAGES.card.rowActionsAriaLabel(doc.id)}
        title={DOCUMENTS_MESSAGES.card.rowActionsTitle}
      >
        <RowActionGroup>
          <RowActionItem
            label={DOCUMENTS_MESSAGES.card.versionHistoryLabel}
            onClick={() => onToggleVersions(doc.id)}
            icon={<History className="h-4 w-4" />}
          />
        </RowActionGroup>
        <RowActionGroup>
          {canEditReplace && (
            <RowActionItem
              label={DOCUMENTS_MESSAGES.card.editDetailsLabel}
              onClick={() => onEdit(doc)}
              icon={<Pencil className="h-4 w-4" />}
            />
          )}
          {canEditReplace && (
            <RowActionItem
              label={
                replacingId === doc.id
                  ? DOCUMENTS_MESSAGES.card.replacingLabel
                  : DOCUMENTS_MESSAGES.card.replaceFileLabel
              }
              onClick={() => onReplace(doc.id)}
              icon={<RefreshCw className="h-4 w-4" />}
              disabled={replacingId === doc.id}
            />
          )}
          {isAdvisor && (
            <RowActionItem
              label={
                deletingId === doc.id ? DOCUMENTS_MESSAGES.card.deletingLabel : DOCUMENTS_MESSAGES.card.deleteLabel
              }
              onClick={() => onDelete(doc.id)}
              icon={<Trash2 className="h-4 w-4" />}
              danger
              disabled={deletingId === doc.id}
            />
          )}
        </RowActionGroup>
      </RowActionsMenu>
    </div>

    <Button
      type="button"
      onClick={() => onPreview(doc)}
      variant="linkPrimary"
      icon={<FileText className="h-3.5 w-3.5 shrink-0 text-gray-400" />}
      truncate
      title={doc.original_filename ?? undefined}
    >
      {doc.original_filename ?? '—'}
    </Button>

    <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
      {doc.tax_year ? (
        <Badge variant="info">{doc.tax_year}</Badge>
      ) : (
        <span className="text-xs text-gray-400">{DOCUMENTS_MESSAGES.card.noTaxYear}</span>
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
        icon={<Eye className="h-3.5 w-3.5" />}
        onClick={() => onPreview(doc)}
        fullWidth
        aria-label={DOCUMENTS_MESSAGES.card.previewAriaLabel}
      >
        {DOCUMENTS_MESSAGES.card.previewLabel}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        icon={<Download className="h-3.5 w-3.5" />}
        isLoading={downloadingId === doc.id}
        onClick={() => onDownload(doc)}
        fullWidth
        aria-label={DOCUMENTS_MESSAGES.card.downloadAriaLabel}
      >
        {DOCUMENTS_MESSAGES.card.downloadLabel}
      </Button>
    </div>
  </Card>
)

DocumentCard.displayName = 'DocumentCard'
