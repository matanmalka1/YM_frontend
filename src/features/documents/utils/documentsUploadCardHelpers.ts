import { formatFileSize } from '../../../utils/utils'
import { DOCUMENT_ACCEPTED_MIME_TYPES, DOCUMENT_MAX_SIZE_BYTES, DOCUMENT_MAX_SIZE_MB } from '../constants'

export const validateDocumentFile = (file: File): string | null => {
  if (file.size > DOCUMENT_MAX_SIZE_BYTES) {
    return `הקובץ גדול מדי: ${formatFileSize(file.size)}. המקסימום הוא ${DOCUMENT_MAX_SIZE_MB}MB`
  }

  if (!DOCUMENT_ACCEPTED_MIME_TYPES.includes(file.type)) {
    return 'סוג הקובץ אינו נתמך. מותרים: PDF, Word, Excel, JPEG, PNG'
  }

  return null
}
