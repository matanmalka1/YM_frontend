// Public surface of the documents feature
export { documentsApi, documentsQK } from './api'
export { ClientDocumentsTab } from './components/shared/ClientDocumentsTab'
export { DocumentPreviewModal } from './components/detail/DocumentPreviewModal'
export { useDocumentPreviewDownload } from './hooks/useDocumentPreviewDownload'
export { useClientDocumentSignals } from './hooks/useClientDocumentSignals'

export { DOC_TYPE_LABELS } from './constants'
