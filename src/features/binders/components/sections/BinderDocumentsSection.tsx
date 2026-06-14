import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Eye, FileText } from 'lucide-react'
import { Card } from '@/components/ui/primitives/Card'
import { Badge } from '@/components/ui/primitives/Badge'
import { Button } from '@/components/ui/primitives/Button'
import { PaginationCard } from '@/components/ui/table/PaginationCard'
import { documentsApi, documentsQK, DOC_TYPE_LABELS, DocumentPreviewModal, useDocumentPreviewDownload } from '@/features/documents'
import { formatDate, getErrorMessage } from '@/utils/utils'

const PAGE_SIZE = 20

interface BinderDocumentsSectionProps {
  binderId: number
}

export const BinderDocumentsSection: React.FC<BinderDocumentsSectionProps> = ({ binderId }) => {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [binderId])

  const { data, isLoading, error } = useQuery({
    queryKey: documentsQK.byBinder(binderId, { page, page_size: PAGE_SIZE }),
    queryFn: () => documentsApi.listByBinder(binderId, { page, page_size: PAGE_SIZE }),
  })

  const { downloadingId, previewDoc, previewUrl, handleDownloadClick, handlePreviewClick, closePreview } =
    useDocumentPreviewDownload()

  const documents = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <Card title="מסמכים בקלסר" subtitle={total ? `${total} מסמכים` : undefined}>
      {isLoading ? (
        <p className="text-sm text-gray-400">טוען מסמכים...</p>
      ) : error ? (
        <p className="text-sm text-negative-600">{getErrorMessage(error, 'שגיאה בטעינת מסמכי הקלסר')}</p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-gray-500">אין מסמכים בקלסר זה</p>
      ) : (
        <>
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate font-medium text-gray-800" title={doc.original_filename ?? undefined}>
                      {doc.original_filename ?? DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}</span>
                      {doc.tax_year && <Badge variant="info">{doc.tax_year}</Badge>}
                      <span>{formatDate(doc.uploaded_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => handlePreviewClick(doc)} aria-label="צפייה במסמך">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    isLoading={downloadingId === doc.id}
                    onClick={() => handleDownloadClick(doc)}
                    aria-label="הורדת מסמך"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <PaginationCard page={page} totalPages={totalPages} total={total} label="מסמכים" onPageChange={setPage} />
          )}
        </>
      )}

      <DocumentPreviewModal
        open={previewDoc !== null}
        onClose={closePreview}
        url={previewUrl}
        filename={previewDoc?.original_filename ?? null}
        mimeType={previewDoc?.mime_type ?? null}
        onDownload={() => previewDoc && handleDownloadClick(previewDoc)}
      />
    </Card>
  )
}

BinderDocumentsSection.displayName = 'BinderDocumentsSection'
