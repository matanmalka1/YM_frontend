import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/ui/overlays/Modal'
import { Button } from '@/components/ui/primitives/Button'
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
      title='הגשת דוח מע"מ'
      isDirty={isDirty}
      onClose={handleClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
            ביטול
          </Button>
          <Button type="button" isLoading={isLoading} onClick={() => void submitForm()}>
            הגש
          </Button>
        </div>
      }
    >
      <div className="space-y-4" dir="rtl">
        <div>
          <Select
            id="vat-file-submission-method"
            label="אופן הגשה"
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
          label="מספר אסמכתא (לא חובה)"
          placeholder="מספר אסמכתא מרשות המסים"
          {...register('submission_reference')}
        />

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary-600"
            {...register('is_amendment')}
          />
          <span className="text-sm font-medium text-gray-700">תיקון להגשה קודמת</span>
        </label>

        {isAmendment && (
          <Input
            label="מזהה ההגשה המקורית"
            type="number"
            min={1}
            placeholder="מזהה דוח מע״מ מקורי"
            error={errors.amends_item_id?.message}
            {...register('amends_item_id')}
          />
        )}
      </div>
    </Modal>
  )
}

VatFileModal.displayName = 'VatFileModal'
