import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '../../../components/ui/overlays/Modal'
import { Button } from '../../../components/ui/primitives/Button'
import { DocumentCard } from './DocumentCard'
import { DocumentsUploadCard, type DocumentUploadSubmitPayload } from './DocumentsUploadCard'
import { DocumentVersionsPanel } from './DocumentVersionsPanel'
import { DocumentPreviewModal } from './DocumentPreviewModal'
import { ConfirmDialog } from '../../../components/ui/overlays/ConfirmDialog'
import type { OperationalSignalsResponse, PermanentDocumentResponse } from '../api'
import { useAuthStore } from '../../../store/auth.store'
import type { BusinessResponse } from '@/features/clients'
import { UPLOAD_FORM_ID } from './DocumentsDataCards.constants'
import { filterDocuments, getCountLabel } from './DocumentsDataCards.utils'
import { useDocumentCardActions } from './useDocumentCardActions'
import { DocumentsDataCardsToolbar } from './DocumentsDataCardsToolbar'
import { DocumentsEmptyState } from './DocumentsEmptyState'

interface DocumentsDataCardsProps {
  documents: PermanentDocumentResponse[]
  signals: OperationalSignalsResponse
  taxYear: number | null
  onTaxYearChange: (year: number | null) => void
  businesses: BusinessResponse[]
  businessesLoading: boolean
  submitUpload: (payload: DocumentUploadSubmitPayload) => Promise<boolean>
  uploadError: string | null
  uploading: boolean
  onDelete: (id: number) => Promise<void>
  onReplace: (id: number, file: File) => Promise<void>
}

export const DocumentsDataCards: React.FC<DocumentsDataCardsProps> = ({
  documents,
  taxYear,
  onTaxYearChange,
  businesses,
  businessesLoading,
  submitUpload,
  uploadError,
  uploading,
  onDelete,
  onReplace,
}) => {
  const role = useAuthStore((s) => s.user?.role)
  const isAdvisor = role === 'advisor'

  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadCanSubmit, setUploadCanSubmit] = useState(false)
  const [expandedVersionsId, setExpandedVersionsId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')

  const {
    confirmDeleteId,
    deletingId,
    replacingId,
    downloadingId,
    previewDoc,
    previewUrl,
    fileInputRef,
    setConfirmDeleteId,
    handleConfirmDelete,
    handleReplaceClick,
    handleFileChange,
    handleDownloadClick,
    handlePreviewClick,
    closePreview,
  } = useDocumentCardActions({ onDelete, onReplace })

  const closeUploadModal = () => {
    setUploadOpen(false)
    setUploadCanSubmit(false)
  }

  const handleToggleVersions = (id: number) => {
    setExpandedVersionsId((prev) => (prev === id ? null : id))
  }

  const filteredDocuments = useMemo(
    () => filterDocuments(documents, search, filterType),
    [documents, filterType, search],
  )

  const expandedDoc = useMemo(
    () => (expandedVersionsId !== null ? documents.find((d) => d.id === expandedVersionsId) : null),
    [documents, expandedVersionsId],
  )

  const countLabel = getCountLabel(filteredDocuments.length, documents.length)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900">מסמכים ({countLabel})</h3>
        <Button variant="ghost" size="sm" onClick={() => setUploadOpen(true)} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          העלאת מסמך
        </Button>
      </div>

      <DocumentsDataCardsToolbar
        search={search}
        onSearchChange={setSearch}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        taxYear={taxYear}
        onTaxYearChange={onTaxYearChange}
      />

      {filteredDocuments.length === 0 ? (
        <DocumentsEmptyState hasDocuments={documents.length > 0} onUploadClick={() => setUploadOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              isAdvisor={isAdvisor}
              downloadingId={downloadingId}
              replacingId={replacingId}
              deletingId={deletingId}
              onDownload={handleDownloadClick}
              onPreview={handlePreviewClick}
              onReplace={handleReplaceClick}
              onDelete={(id) => setConfirmDeleteId(id)}
              onToggleVersions={handleToggleVersions}
            />
          ))}
        </div>
      )}

      {expandedDoc && (
        <DocumentVersionsPanel
          clientId={expandedDoc.client_record_id}
          documentType={expandedDoc.document_type}
          taxYear={expandedDoc.tax_year ?? undefined}
        />
      )}

      <Modal
        open={uploadOpen}
        title="העלאת מסמך חדש"
        onClose={closeUploadModal}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={closeUploadModal} disabled={uploading}>
              ביטול
            </Button>
            <Button
              type="submit"
              form={UPLOAD_FORM_ID}
              isLoading={uploading}
              loadingLabel="מעלה..."
              disabled={!uploadCanSubmit}
              className="gap-2 shrink-0"
            >
              העלה מסמך
            </Button>
          </div>
        }
      >
        <DocumentsUploadCard
          formId={UPLOAD_FORM_ID}
          businesses={businesses}
          businessesLoading={businessesLoading}
          submitUpload={submitUpload}
          uploadError={uploadError}
          uploading={uploading}
          initialTaxYear={taxYear}
          onCanSubmitChange={setUploadCanSubmit}
          onSuccess={closeUploadModal}
        />
      </Modal>

      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

      <DocumentPreviewModal
        open={previewDoc !== null}
        onClose={closePreview}
        url={previewUrl}
        filename={previewDoc?.original_filename ?? null}
        mimeType={previewDoc?.mime_type ?? null}
        onDownload={() => previewDoc && handleDownloadClick(previewDoc.id)}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="מחיקת מסמך"
        message="האם למחוק מסמך זה?"
        confirmLabel="מחק"
        cancelLabel="ביטול"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}

DocumentsDataCards.displayName = 'DocumentsDataCards'
