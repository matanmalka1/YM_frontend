import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Select } from '../../../../components/ui/inputs/Select'
import { Input } from '../../../../components/ui/inputs/Input'
import type { PermanentDocumentResponse, UpdateDocumentPayload } from '../../api'
import { documentEditSchema, type DocumentEditFormValues } from '../../schemas'
import { UPLOAD_DOCUMENT_TYPE_OPTIONS, UPLOAD_TAX_YEAR_OPTIONS } from '../../constants'

export const EDIT_FORM_ID = 'documents-edit-form'

interface DocumentEditCardProps {
  doc: PermanentDocumentResponse
  formId?: string
  editError: string | null
  onSubmit: (payload: UpdateDocumentPayload) => Promise<void>
}

export const DocumentEditCard: React.FC<DocumentEditCardProps> = ({
  doc,
  formId = EDIT_FORM_ID,
  editError,
  onSubmit,
}) => {
  const {
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<DocumentEditFormValues>({
    defaultValues: {
      document_type: doc.document_type as DocumentEditFormValues['document_type'],
      original_filename: doc.original_filename ?? '',
      tax_year: doc.tax_year,
    },
    resolver: zodResolver(documentEditSchema),
  })

  useEffect(() => {
    reset({
      document_type: doc.document_type as DocumentEditFormValues['document_type'],
      original_filename: doc.original_filename ?? '',
      tax_year: doc.tax_year,
    })
  }, [doc.id, doc.document_type, doc.original_filename, doc.tax_year, reset])

  const documentType = watch('document_type')
  const taxYear = watch('tax_year')
  const filename = watch('original_filename')

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      document_type: values.document_type,
      original_filename: values.original_filename,
      tax_year: values.tax_year,
    })
  })

  return (
    <form id={formId} onSubmit={submit} className="space-y-4">
      <Input
        label="שם קובץ"
        value={filename}
        onChange={(e) => setValue('original_filename', e.target.value, { shouldValidate: true })}
        error={errors.original_filename?.message}
      />

      <Select
        label="סוג מסמך"
        value={documentType}
        onChange={(e) =>
          setValue('document_type', e.target.value as DocumentEditFormValues['document_type'], {
            shouldValidate: true,
          })
        }
        options={UPLOAD_DOCUMENT_TYPE_OPTIONS}
        error={errors.document_type?.message}
      />

      <Select
        label="שנת מס"
        value={taxYear ?? ''}
        onChange={(e) => setValue('tax_year', e.target.value ? Number(e.target.value) : null, { shouldValidate: true })}
        options={UPLOAD_TAX_YEAR_OPTIONS}
      />

      {editError && <p className="text-sm text-negative-600">{editError}</p>}
    </form>
  )
}

DocumentEditCard.displayName = 'DocumentEditCard'
