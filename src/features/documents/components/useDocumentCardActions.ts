import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { documentsApi } from '../api'
import type { PermanentDocumentResponse } from '../api'
import { toast } from '../../../utils/toast'
import { DOWNLOAD_ERROR_MESSAGE, PREVIEW_ERROR_MESSAGE } from './DocumentsDataCards.constants'

interface UseDocumentCardActionsParams {
  onDelete: (id: number) => Promise<void>
  onReplace: (id: number, file: File) => Promise<void>
}

export const useDocumentCardActions = ({ onDelete, onReplace }: UseDocumentCardActionsParams) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [replacingId, setReplacingId] = useState<number | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [previewDoc, setPreviewDoc] = useState<PermanentDocumentResponse | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingReplaceId = useRef<number | null>(null)

  const handleConfirmDelete = async () => {
    if (confirmDeleteId === null) return
    setDeletingId(confirmDeleteId)
    setConfirmDeleteId(null)
    try {
      await onDelete(confirmDeleteId)
    } finally {
      setDeletingId(null)
    }
  }

  const handleReplaceClick = (id: number) => {
    pendingReplaceId.current = id
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const id = pendingReplaceId.current
    if (!file || id === null) return
    e.target.value = ''
    setReplacingId(id)
    try {
      await onReplace(id, file)
    } finally {
      setReplacingId(null)
      pendingReplaceId.current = null
    }
  }

  const handleDownloadClick = async (doc: PermanentDocumentResponse) => {
    setDownloadingId(doc.id)
    try {
      const { url } = await documentsApi.getDownloadUrl(doc.client_record_id, doc.id)
      window.open(url, '_blank')
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
  }
}
