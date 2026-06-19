import { useState } from 'react'
import { documentsApi } from '../api'
import type { PermanentDocumentResponse } from '../api'
import { toast } from '../../../utils/toast'
import { DOWNLOAD_ERROR_MESSAGE, PREVIEW_ERROR_MESSAGE } from '../constants'

export const useDocumentPreviewDownload = () => {
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [previewDoc, setPreviewDoc] = useState<PermanentDocumentResponse | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleDownloadClick = async (doc: PermanentDocumentResponse) => {
    setDownloadingId(doc.id)
    try {
      const { url } = await documentsApi.getDownloadUrl(doc.client_record_id, doc.id)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      toast.error(DOWNLOAD_ERROR_MESSAGE)
    } finally {
      setDownloadingId(null)
    }
  }

  const handlePreviewClick = async (doc: PermanentDocumentResponse) => {
    setPreviewDoc(doc)
    setPreviewUrl(null)
    try {
      const { url } = await documentsApi.getDownloadUrl(doc.client_record_id, doc.id)
      setPreviewUrl(url)
    } catch {
      toast.error(PREVIEW_ERROR_MESSAGE)
      setPreviewDoc(null)
    }
  }

  const closePreview = () => {
    setPreviewDoc(null)
    setPreviewUrl(null)
  }

  return {
    downloadingId,
    previewDoc,
    previewUrl,
    handleDownloadClick,
    handlePreviewClick,
    closePreview,
  }
}
