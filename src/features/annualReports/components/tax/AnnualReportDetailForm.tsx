import { useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DatePicker } from '../../../../components/ui/inputs/DatePicker'
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
  client_approved_at: detail?.client_approved_at?.split('T')[0] ?? '',
  internal_notes: detail?.internal_notes ?? '',
})

export const AnnualReportDetailForm: React.FC<AnnualReportDetailFormProps> = ({ detail, onSave, onDirtyChange, submitRef }) => {
  const onDirtyChangeRef = useRef(onDirtyChange)
  onDirtyChangeRef.current = onDirtyChange

  const {
    register,
    control,
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
      client_approved_at: values.client_approved_at || null,
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
      <Controller
        control={control}
        name="client_approved_at"
        render={({ field }) => (
          <DatePicker
            label={ANNUAL_REPORTS_MESSAGES.detailForm.clientApprovedAtLabel}
            error={errors.client_approved_at?.message}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

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
