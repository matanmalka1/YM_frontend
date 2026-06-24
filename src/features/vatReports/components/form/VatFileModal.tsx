import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/ui/overlays/Modal'
import { ModalFormActions } from '@/components/ui/overlays/ModalFormActions'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { Checkbox } from '@/components/ui/primitives/Checkbox'
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
  onFilingStart?: () => void
  onFilingEnd?: () => void
}

export const VatFileModal: React.FC<VatFileModalProps> = ({
  open,
  workItemId,
  onClose,
  onFilingStart,
  onFilingEnd,
}) => {
  const { fileVatReturn, isLoading } = useFileVatReturn(workItemId)
  const {
    formState: { errors, isDirty },
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
  const isAmendment = watch('is_amendment')

  useEffect(() => {
    if (open) reset(vatFileModalDefaultValues)
  }, [open, reset])

  const handleClose = () => {
    reset(vatFileModalDefaultValues)
    onClose()
  }

  const submitForm = handleSubmit(async (values) => {
    onFilingStart?.()
    const ok = await fileVatReturn(toFileVatReturnPayload(values))
    onFilingEnd?.()
    if (ok) handleClose()
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

        <Checkbox label={VAT_MESSAGES.form.amendmentLabel} {...register('is_amendment')} />

        {isAmendment && (
          <Input
            label={VAT_MESSAGES.form.amendsItemIdLabel}
            type="number"
            min={1}
            placeholder={VAT_MESSAGES.form.amendsItemIdPlaceholder}
            error={errors.amends_item_id?.message}
            {...register('amends_item_id')}
          />
        )}
      </div>
    </Modal>
  )
}

VatFileModal.displayName = 'VatFileModal'
