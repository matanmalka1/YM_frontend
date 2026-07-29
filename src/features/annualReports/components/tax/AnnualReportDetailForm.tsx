import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Textarea } from '../../../../components/ui/inputs/Textarea'
import type { AnnualReportDetailUpdatePayload, AnnualReportFull } from '../../api'
import { annualReportDetailSchema, annualReportDetailDefaults, type AnnualReportDetailFormValues } from '../../schemas'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

interface AnnualReportDetailFormProps {
  detail: AnnualReportFull | null
  onSave: (data: AnnualReportDetailUpdatePayload) => void
  onDirtyChange?: (dirty: boolean) => void
  submitRef?: React.RefObject<(() => void) | null>
}

const toFormValues = (detail: AnnualReportFull | null): AnnualReportDetailFormValues => ({
  ...annualReportDetailDefaults,
  internal_notes: detail?.internal_notes ?? '',
})

export const AnnualReportDetailForm: React.FC<AnnualReportDetailFormProps> = ({ detail, onSave, onDirtyChange, submitRef }) => {
  const onDirtyChangeRef = useRef(onDirtyChange)
  onDirtyChangeRef.current = onDirtyChange

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<AnnualReportDetailFormValues>({
    resolver: zodResolver(annualReportDetailSchema),
    // `values` reactively resyncs the form when `detail` changes — replaces a
    // manual reset()-in-effect (no stale-deps risk).
    values: toFormValues(detail),
  })

  useEffect(() => {
    onDirtyChangeRef.current?.(isDirty)
  }, [isDirty])

  const onSubmit = handleSubmit((values) => {
    onSave({
      internal_notes: values.internal_notes || null,
    })
  })

  useEffect(() => {
    if (submitRef) {
      submitRef.current = onSubmit
    }
  }, [submitRef, onSubmit])

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Textarea
        label={ANNUAL_REPORTS_MESSAGES.detailForm.internalNotesLabel}
        rows={3}
        error={errors.internal_notes?.message}
        {...register('internal_notes')}
      />
    </form>
  )
}

AnnualReportDetailForm.displayName = 'AnnualReportDetailForm'
