import { useQuery } from '@tanstack/react-query'
import { documentsApi, documentsQK } from '../../api'
import { Badge } from '../../../../components/ui/primitives/Badge'
import { STATUS_LABELS, getDocumentStatusVariant } from '../../constants'
import { formatDate, formatFileSize } from '../../../../utils/utils'

interface DocumentVersionsPanelProps {
  clientId: number
  documentType: string
  taxYear?: number
}

export const DocumentVersionsPanel: React.FC<DocumentVersionsPanelProps> = ({ clientId, documentType, taxYear }) => {
  const { data, isLoading } = useQuery({
    queryKey: documentsQK.versions(clientId, documentType, taxYear),
    queryFn: () => documentsApi.getVersions(clientId, documentType, taxYear),
  })

  const items = data?.items ?? []
  const hasMore = data?.has_more ?? false

  if (isLoading) {
    return <div className="px-4 py-2 text-xs text-gray-400">טוען גרסאות...</div>
  }

  if (items.length === 0) {
    return <div className="px-4 py-2 text-xs text-gray-400">אין גרסאות קודמות</div>
  }

  return (
    <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
      <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">היסטוריית גרסאות</p>
      <ul className="space-y-2">
        {items.map((v) => (
          <li key={v.id} className="flex items-center gap-3 text-xs text-gray-700">
            <span className="inline-block rounded-full bg-gray-200 px-1.5 py-0.5 text-gray-600 font-mono shrink-0">
              v{v.version}
            </span>
            <span className="tabular-nums text-gray-400 shrink-0">{formatDate(v.uploaded_at)}</span>
            <Badge variant={getDocumentStatusVariant(v.status)}>{STATUS_LABELS[v.status] ?? v.status}</Badge>
            {v.original_filename && (
              <span className="truncate max-w-[180px] text-gray-600" title={v.original_filename}>
                {v.original_filename}
              </span>
            )}
            {v.file_size_bytes != null && (
              <span className="text-gray-400 shrink-0">{formatFileSize(v.file_size_bytes)}</span>
            )}
          </li>
        ))}
      </ul>
      {hasMore && <p className="mt-2 text-xs text-gray-400">מוצגות 10 גרסאות אחרונות בלבד</p>}
    </div>
  )
}

DocumentVersionsPanel.displayName = 'DocumentVersionsPanel'
