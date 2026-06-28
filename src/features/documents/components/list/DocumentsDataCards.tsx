import { useMemo, useState } from 'react'
import { FileText, Plus } from 'lucide-react'
import { Modal } from '../../../../components/ui/overlays/Modal'
import { HiddenFileInput } from '../../../../components/ui/inputs/HiddenFileInput'
import { Button } from '../../../../components/ui/primitives/Button'
import { DocumentCard } from './DocumentCard'
import { DocumentsUploadCard, type DocumentUploadSubmitPayload } from '../form/DocumentsUploadCard'
import { DocumentVersionsPanel } from '../detail/DocumentVersionsPanel'
import { DocumentPreviewModal } from '../detail/DocumentPreviewModal'
import { ConfirmDialog } from '../../../../components/ui/overlays/ConfirmDialog'
import type { OperationalSignalsResponse, PermanentDocumentResponse, UpdateDocumentPayload } from '../../api'
import { DocumentEditCard, EDIT_FORM_ID } from '../form/DocumentEditCard'
import { useAuthStore } from '../../../../store/auth.store'
import type { BusinessResponse } from '@/features/clients'
import { UPLOAD_FORM_ID } from '../../constants'
import { filterDocuments, getCountLabel } from '../../utils/documentsDataCardsUtils'
import { useDocumentCardActions } from '../../hooks/useDocumentCardActions'
import { DocumentsFilterPanel } from './DocumentsFilterPanel'
import { StateCard } from '../../../../components/ui/feedback/StateCard'
import { DOCUMENTS_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

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
  onUpdate: (id: number, payload: UpdateDocumentPayload) => Promise<void>
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
  onUpdate,
}) => {
  const role = useAuthStore((s) => s.user?.role)
  const isAdvisor = role === 'advisor'
  const canEditReplace = role === 'advisor' || role === 'secretary'

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
    editDoc,
    editError,
    updatingId,
    fileInputRef,
    setConfirmDeleteId,
    handleConfirmDelete,
    handleReplaceClick,
    handleFileChange,
    handleDownloadClick,
    handlePreviewClick,
    closePreview,
    handleEditClick,
    closeEdit,
    handleEditSubmit,
  } = useDocumentCardActions({ onDelete, onReplace, onUpdate })

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
        <h3 className="text-base font-semibold text-gray-900">{DOCUMENTS_MESSAGES.list.sectionTitle(countLabel)}</h3>
        <Button variant="ghost" size="sm" onClick={() => setUploadOpen(true)} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          {DOCUMENTS_MESSAGES.list.uploadButton}
        </Button>
      </div>

      <DocumentsFilterPanel
        search={search}
        onSearchChange={setSearch}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        taxYear={taxYear}
        onTaxYearChange={onTaxYearChange}
      />

      {filteredDocuments.length === 0 ? (
        documents.length > 0 ? (
          <StateCard icon={FileText} message={DOCUMENTS_MESSAGES.list.noResultsMessage} />
        ) : (
          <StateCard
            icon={FileText}
            message={DOCUMENTS_MESSAGES.list.emptyMessage}
            action={{ label: DOCUMENTS_MESSAGES.list.firstUploadAction, onClick: () => setUploadOpen(true) }}
          />
        )
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              isAdvisor={isAdvisor}
              canEditReplace={canEditReplace}
              downloadingId={downloadingId}
              replacingId={replacingId}
              deletingId={deletingId}
              onDownload={handleDownloadClick}
              onPreview={handlePreviewClick}
              onReplace={handleReplaceClick}
              onDelete={(id) => setConfirmDeleteId(id)}
              onToggleVersions={handleToggleVersions}
              onEdit={handleEditClick}
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
        title={DOCUMENTS_MESSAGES.list.uploadModalTitle}
        onClose={closeUploadModal}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={closeUploadModal} disabled={uploading}>
              {GLOBAL_UI_MESSAGES.actions.cancel}
            </Button>
            <Button
              type="submit"
              form={UPLOAD_FORM_ID}
              isLoading={uploading}
              loadingLabel={DOCUMENTS_MESSAGES.list.uploading}
              disabled={!uploadCanSubmit}
              className="gap-2 shrink-0"
            >
              {DOCUMENTS_MESSAGES.list.uploadSubmit}
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

      <HiddenFileInput
        ref={fileInputRef}
        aria-label={DOCUMENTS_MESSAGES.form.uploadFileAriaLabel}
        onChange={handleFileChange}
      />

      <DocumentPreviewModal
        open={previewDoc !== null}
        onClose={closePreview}
        url={previewUrl}
        filename={previewDoc?.original_filename ?? null}
        mimeType={previewDoc?.mime_type ?? null}
        onDownload={() => previewDoc && handleDownloadClick(previewDoc)}
      />

      <Modal
        open={editDoc !== null}
        title={DOCUMENTS_MESSAGES.list.editModalTitle}
        onClose={closeEdit}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={closeEdit} disabled={updatingId !== null}>
              {GLOBAL_UI_MESSAGES.actions.cancel}
            </Button>
            <Button
              type="submit"
              form={EDIT_FORM_ID}
              isLoading={editDoc ? updatingId === editDoc.id : false}
              loadingLabel={DOCUMENTS_MESSAGES.list.saving}
              className="gap-2 shrink-0"
            >
              {DOCUMENTS_MESSAGES.list.saveLabel}
            </Button>
          </div>
        }
      >
        {editDoc && (
          <DocumentEditCard doc={editDoc} formId={EDIT_FORM_ID} editError={editError} onSubmit={handleEditSubmit} />
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title={DOCUMENTS_MESSAGES.list.deleteModalTitle}
        message={DOCUMENTS_MESSAGES.list.deleteMessage}
        confirmLabel={DOCUMENTS_MESSAGES.list.deleteConfirm}
        cancelLabel={GLOBAL_UI_MESSAGES.actions.cancel}
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}

DocumentsDataCards.displayName = 'DocumentsDataCards'
