import { Paperclip, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../../../../components/ui/primitives/Button'
import { RowActionButton } from '@/components/ui/table'
import { formatCurrencyILS } from '@/utils/utils'
import { documentsApi } from '@/features/documents'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

export interface LineRowProps {
  label: string
  amount: string | number
  description?: string | null
  recognitionRate?: string | number | null
  supportingDocumentRef?: string | null
  supportingDocumentId?: number | null
  supportingDocumentClientRecordId?: number | null
  supportingDocumentFilename?: string | null
  onEdit?: () => void
  onDelete: () => void
  isDeleting: boolean
}

export const LineRow: React.FC<LineRowProps> = ({
  label,
  amount,
  description,
  recognitionRate,
  supportingDocumentRef,
  supportingDocumentId,
  supportingDocumentClientRecordId,
  supportingDocumentFilename,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  const handleDownload = async () => {
    if (!supportingDocumentId || !supportingDocumentClientRecordId) return
    const { url } = await documentsApi.getDownloadUrl(supportingDocumentClientRecordId, supportingDocumentId)
    window.open(url, '_blank')
  }

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0 text-sm">
      <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
        <span className="font-medium text-gray-800">{label}</span>
        {description && <span className="text-gray-500 mr-1">— {description}</span>}
        {recognitionRate != null && Number(recognitionRate) < 100 && (
          <span className="inline-flex items-center rounded bg-warning-100 px-1.5 py-0.5 text-xs font-medium text-warning-800">
            {Number(recognitionRate)}%
          </span>
        )}
        {supportingDocumentId ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<Paperclip className="h-3 w-3" />}
            onClick={handleDownload}
            className="p-0 text-primary-500 hover:text-primary-700 hover:bg-transparent"
            title={supportingDocumentFilename ?? ANNUAL_REPORTS_MESSAGES.financialLineRow.attachedDocument}
          >
            <span className="text-xs">
              {supportingDocumentFilename ?? ANNUAL_REPORTS_MESSAGES.financialLineRow.document}
            </span>
          </Button>
        ) : supportingDocumentRef ? (
          <span className="flex items-center gap-0.5 text-xs text-gray-500" title={supportingDocumentRef}>
            <Paperclip className="h-3 w-3" />
            {supportingDocumentRef}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2 mr-2">
        <span className="text-gray-700 font-mono">{formatCurrencyILS(amount)}</span>
        {onEdit ? (
          <RowActionButton
            label={ANNUAL_REPORTS_MESSAGES.financialLineRow.editLine}
            icon={<Pencil className="h-3.5 w-3.5" />}
            tone="primary"
            size="sm"
            onClick={onEdit}
          />
        ) : null}
        <RowActionButton
          label={ANNUAL_REPORTS_MESSAGES.financialLineRow.deleteLine}
          icon={<Trash2 className="h-3.5 w-3.5" />}
          tone="danger"
          size="sm"
          onClick={onDelete}
          disabled={isDeleting}
        />
      </div>
    </div>
  )
}

LineRow.displayName = 'LineRow'
