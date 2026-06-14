import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { PermanentDocumentResponse, UpdateDocumentPayload } from '../api'
import { getErrorMessage } from '../../../utils/utils'
import { useDocumentPreviewDownload } from './useDocumentPreviewDownload'

interface UseDocumentCardActionsParams {
  onDelete: (id: number) => Promise<void>
  onReplace: (id: number, file: File) => Promise<void>
  onUpdate: (id: number, payload: UpdateDocumentPayload) => Promise<void>
}

export const useDocumentCardActions = ({ onDelete, onReplace, onUpdate }: UseDocumentCardActionsParams) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [replacingId, setReplacingId] = useState<number | null>(null)
  const previewDownload = useDocumentPreviewDownload()
  const [editDoc, setEditDoc] = useState<PermanentDocumentResponse | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

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

  const handleEditClick = (doc: PermanentDocumentResponse) => {
    setEditError(null)
    setEditDoc(doc)
  }

  const closeEdit = () => {
    setEditDoc(null)
    setEditError(null)
  }

  const handleEditSubmit = async (payload: UpdateDocumentPayload) => {
    if (!editDoc) return
    setUpdatingId(editDoc.id)
    setEditError(null)
    try {
      await onUpdate(editDoc.id, payload)
      closeEdit()
    } catch (err) {
      setEditError(getErrorMessage(err, 'שגיאה בעדכון פרטי המסמך'))
    } finally {
      setUpdatingId(null)
    }
  }

  return {
    confirmDeleteId,
    deletingId,
    replacingId,
    ...previewDownload,
    editDoc,
    editError,
    updatingId,
    fileInputRef,
    setConfirmDeleteId,
    handleConfirmDelete,
    handleReplaceClick,
    handleFileChange,
    handleEditClick,
    closeEdit,
    handleEditSubmit,
  }
}
