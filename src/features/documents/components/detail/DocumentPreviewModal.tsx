import { Download } from 'lucide-react'
import { OverlayContainer } from '../../../../components/ui/layout/OverlayContainer'
import { Button } from '../../../../components/ui/primitives/Button'
import { DOCUMENTS_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface DocumentPreviewModalProps {
  open: boolean
  onClose: () => void
  url: string | null
  filename: string | null
  mimeType: string | null
  onDownload: () => void
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  open,
  onClose,
  url,
  filename,
  mimeType,
  onDownload,
}) => {
  const isPdf = mimeType === 'application/pdf' || filename?.toLowerCase().endsWith('.pdf')
  const isImage = mimeType?.startsWith('image/')

  return (
    <OverlayContainer
      open={open}
      variant="modal"
      title={filename ?? GLOBAL_UI_MESSAGES.actions.preview}
      onClose={onClose}
      className="max-w-4xl w-full"
      footer={
        <div className="flex justify-end">
          <Button variant="secondary" icon={<Download className="h-4 w-4" />} onClick={onDownload}>
            {DOCUMENTS_MESSAGES.preview.downloadButton}
          </Button>
        </div>
      }
    >
      {!url ? (
        <div className="flex items-center justify-center py-16 text-sm text-gray-400">
          {GLOBAL_UI_MESSAGES.common.loading}
        </div>
      ) : isPdf ? (
        // No `sandbox`: Chrome's built-in PDF viewer requires both allow-scripts
        // and allow-same-origin to render, and that pair defeats the sandbox
        // anyway. The src is a same-origin document we serve, so we accept the
        // unsandboxed frame rather than break preview. (react-doctor
        // iframe-missing-sandbox is a known can't-fix here.)
        <iframe src={url} className="h-[70vh] w-full rounded border border-gray-100" title={filename ?? 'document'} />
      ) : isImage ? (
        <div className="flex justify-center">
          <img src={url} alt={filename ?? 'document'} className="max-h-[70vh] max-w-full object-contain rounded" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-sm text-gray-500">
          <p>{DOCUMENTS_MESSAGES.preview.unsupportedFile}</p>
          <Button variant="secondary" icon={<Download className="h-4 w-4" />} onClick={onDownload}>
            {DOCUMENTS_MESSAGES.preview.downloadFileButton}
          </Button>
        </div>
      )}
    </OverlayContainer>
  )
}

DocumentPreviewModal.displayName = 'DocumentPreviewModal'
