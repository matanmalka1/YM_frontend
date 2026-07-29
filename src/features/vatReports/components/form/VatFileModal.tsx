import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/ui/overlays/Modal'
import { ModalFormActions } from '@/components/ui/overlays/ModalFormActions'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { VAT_FILING_METHOD_LABELS, VAT_FILING_METHODS } from '../../constants/vatConstants'
import { useFileVatReturn } from '../../hooks/useFileVatReturn'
import {
  toFileVatReturnPayload,
  vatFileModalDefaultValues,
  vatFileModalSchema,
  type VatFileModalFormValues,
} from '../../schemas/fileVatReturn.schema'
import { VAT_MESSAGES } from '../../messages'

interface VatFileModalProps {
  open: boolean
  workItemId: number
  onClose: () => void
}

export const VatFileModal: React.FC<VatFileModalProps> = ({ open, workItemId, onClose }) => {
  const { fileVatReturn, isLoading } = useFileVatReturn(workItemId)
  const {
    formState: { isDirty },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<VatFileModalFormValues>({
    defaultValues: vatFileModalDefaultValues,
    resolver: zodResolver(vatFileModalSchema),
  })

  const filingMethod = watch('submission_method')

  useEffect(() => {
    if (open) reset(vatFileModalDefaultValues)
  }, [open, reset])

  const handleClose = () => {
    reset(vatFileModalDefaultValues)
    onClose()
  }

  const submitForm = handleSubmit(async (values) => {
    if (await fileVatReturn(toFileVatReturnPayload(values))) handleClose()
  })

  return (
    <Modal
      open={open}
      title={VAT_MESSAGES.form.filingModalTitle}
      isDirty={isDirty}
      onClose={handleClose}
      footer={
        <ModalFormActions
          cancelVariant="secondary"
          isLoading={isLoading}
          submitType="button"
          onSubmit={() => void submitForm()}
          submitLabel={VAT_MESSAGES.actions.file}
        />
      }
    >
      <div className="space-y-4">
        <div>
          <Select
            id="vat-file-submission-method"
            label={VAT_MESSAGES.form.filingMethodLabel}
            value={filingMethod}
            onChange={(e) =>
              setValue('submission_method', e.target.value as VatFileModalFormValues['submission_method'], {
                shouldDirty: true,
                shouldValidate: true,
                shouldTouch: true,
              })
            }
            options={VAT_FILING_METHODS.map((m) => ({
              value: m,
              label: VAT_FILING_METHOD_LABELS[m],
            }))}
          />
          <input type="hidden" {...register('submission_method')} />
        </div>

        <Input
          label={VAT_MESSAGES.form.submissionReferenceLabel}
          placeholder={VAT_MESSAGES.form.submissionReferencePlaceholder}
          {...register('submission_reference')}
        />
      </div>
    </Modal>
  )
}

VatFileModal.displayName = 'VatFileModal'
