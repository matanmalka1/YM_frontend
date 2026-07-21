import { useEffect, useRef, useState } from 'react'
import { CloudUpload, X } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { HiddenFileInput } from '../../../../components/ui/inputs/HiddenFileInput'
import { Select } from '../../../../components/ui/inputs/Select'
import type { UploadDocumentPayload } from '../../api'
import type { BusinessResponse } from '@/features/clients'
import { documentsUploadDefaultValues, documentsUploadSchema, type DocumentsUploadFormValues } from '../../schemas'
import { CLIENT_SCOPE_TYPES, DOCUMENT_FILE_ACCEPT } from '../../constants'
import { formatFileSize } from '../../../../utils/utils'
import { Button } from '../../../../components/ui/primitives/Button'
import { UPLOAD_DOCUMENT_TYPE_OPTIONS, UPLOAD_TAX_YEAR_OPTIONS } from '../../constants'
import { getBusinessOptions } from '../../utils/documentsDataCardsUtils'
import { validateDocumentFile } from '../../utils/documentsUploadCardHelpers'
import { DOCUMENTS_MESSAGES } from '../../messages'

export type DocumentUploadSubmitPayload = {
  document_type: UploadDocumentPayload['document_type']
  business_id?: number | null
  file: File
  tax_year?: number | null
}

interface DocumentsUploadCardProps {
  businesses: BusinessResponse[]
  businessesLoading: boolean
  submitUpload: (payload: DocumentUploadSubmitPayload) => Promise<boolean>
  uploadError: string | null
  uploading: boolean
  initialTaxYear?: number | null
  formId: string
  onSuccess?: () => void
  onCanSubmitChange?: (canSubmit: boolean) => void
}

export const DocumentsUploadCard: React.FC<DocumentsUploadCardProps> = ({
  businesses,
  businessesLoading,
  submitUpload,
  uploadError,
  initialTaxYear,
  formId,
  onSuccess,
  onCanSubmitChange,
}) => {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<DocumentsUploadFormValues>({
    defaultValues: {
      ...documentsUploadDefaultValues,
      tax_year: initialTaxYear ?? null,
    },
    resolver: zodResolver(documentsUploadSchema),
  })

  const [isDragging, setIsDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedFile = watch('file')
  const selectedDocType = watch('document_type')
  const selectedBusinessId = watch('business_id')
  const selectedTaxYear = watch('tax_year')
  const canSubmit = Boolean(selectedDocType && selectedFile)

  useEffect(() => {
    onCanSubmitChange?.(canSubmit)
  }, [canSubmit, onCanSubmitChange])

  const applyFile = (file: File) => {
    const error = validateDocumentFile(file)
    setFileError(error)
    if (error) {
      return
    }

    setValue('file', file, { shouldValidate: true })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) applyFile(file)
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!values.file) return
    const uploaded = await submitUpload({
      document_type: values.document_type,
      business_id: values.business_id,
      file: values.file,
      tax_year: values.tax_year ?? null,
    })
    if (uploaded) {
      reset({ ...documentsUploadDefaultValues, tax_year: initialTaxYear ?? null })
      setFileError(null)
      onSuccess?.()
    }
  })

  const isClientScopedType = CLIENT_SCOPE_TYPES.has(selectedDocType)
  const showBusinessSelect = businesses.length > 1
  const documentTypeField = register('document_type')
  const businessOptions = getBusinessOptions(businesses)

  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          label={DOCUMENTS_MESSAGES.form.documentTypeLabel}
          error={errors.document_type?.message}
          value={selectedDocType}
          name={documentTypeField.name}
          onBlur={documentTypeField.onBlur}
          onChange={(e) => {
            const type = e.target.value as UploadDocumentPayload['document_type']
            setValue('document_type', type, { shouldValidate: true })
            if (CLIENT_SCOPE_TYPES.has(type)) {
              setValue('business_id', null, { shouldValidate: false })
            }
          }}
          options={UPLOAD_DOCUMENT_TYPE_OPTIONS}
        />

        <Select
          label={DOCUMENTS_MESSAGES.form.taxYearOptionalLabel}
          value={selectedTaxYear ?? ''}
          onChange={(e) =>
            setValue('tax_year', e.target.value ? Number(e.target.value) : null, {
              shouldValidate: true,
            })
          }
          options={UPLOAD_TAX_YEAR_OPTIONS}
        />

        {showBusinessSelect && (
          <div>
            <Select
              label={DOCUMENTS_MESSAGES.form.businessAssociationLabel}
              value={isClientScopedType ? '' : (selectedBusinessId ?? '')}
              onChange={(e) =>
                setValue('business_id', e.target.value ? Number(e.target.value) : null, {
                  shouldValidate: true,
                })
              }
              disabled={businessesLoading || isClientScopedType}
              options={businessOptions}
            />
            {isClientScopedType && <p className="mt-1 text-xs text-gray-400">{DOCUMENTS_MESSAGES.form.clientScopedTypeNote}</p>}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-medium text-gray-700">{DOCUMENTS_MESSAGES.form.fileLabel}</span>
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={[
            'flex min-h-16 cursor-pointer flex-col gap-2 rounded-xl border-2 border-dashed px-3 py-3 text-right transition-colors sm:flex-row sm:items-center sm:justify-between',
            isDragging
              ? 'border-primary-400 bg-primary-50'
              : selectedFile
                ? 'border-positive-400 bg-positive-50'
                : 'border-gray-200 bg-gray-50 hover:border-primary-300 hover:bg-gray-100',
          ].join(' ')}
        >
          {selectedFile ? (
            <>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <span className="max-w-sm truncate">{selectedFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={<X className="h-4 w-4" />}
                  onClick={(e) => {
                    e.stopPropagation()
                    setValue('file', null, { shouldValidate: false })
                    setFileError(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="rounded-full p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                  aria-label={DOCUMENTS_MESSAGES.form.removeFileAriaLabel}
                />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{formatFileSize(selectedFile.size)}</span>
                <span className="font-medium text-positive-700">{DOCUMENTS_MESSAGES.form.readyToUpload}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
                  <CloudUpload className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-gray-700">{DOCUMENTS_MESSAGES.form.dropOrClickPrompt}</p>
                  <p className="text-2xs text-gray-400">{DOCUMENTS_MESSAGES.form.acceptedFormats}</p>
                </div>
              </div>
              <span className="text-2xs font-medium text-primary-700">{DOCUMENTS_MESSAGES.form.chooseFile}</span>
            </>
          )}
        </div>
        <HiddenFileInput
          ref={fileInputRef}
          aria-label={DOCUMENTS_MESSAGES.form.uploadFileAriaLabel}
          accept={DOCUMENT_FILE_ACCEPT}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) applyFile(file)
            e.target.value = ''
          }}
        />
        {(fileError || errors.file?.message) && <p className="text-xs text-negative-600">{fileError ?? errors.file?.message}</p>}
      </div>

      {uploadError && <p className="text-sm text-negative-600">{uploadError}</p>}
    </form>
  )
}

DocumentsUploadCard.displayName = 'DocumentsUploadCard'
