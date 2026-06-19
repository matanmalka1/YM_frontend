import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/overlays/Modal'
import { Input } from '@/components/ui/inputs/Input'
import { Button } from '@/components/ui/primitives/Button'
import { Select } from '@/components/ui/inputs/Select'
import {
  createAdvancePaymentSchema,
  CREATE_ADVANCE_PAYMENT_DEFAULTS,
  type CreateAdvancePaymentFormValues,
} from '../../schemas'
import { ADVANCE_PAYMENT_FREQUENCY_OPTIONS } from '../../constants'
import type { CreateAdvancePaymentPayload } from '../../api/contracts'
import {
  buildCreateAdvancePaymentPayload,
  calcAdvanceAmount,
  getAdvancePaymentMonthOptions,
  getValidBimonthlyMonth,
  toFrequency,
  toNumberOrNull,
} from '../../utils/advancePaymentComponentUtils'
import { formatShekelAmount } from '@/utils/utils'

interface CreateAdvancePaymentModalProps {
  open: boolean
  clientRecordId: number
  year: number
  defaultPeriodMonthsCount?: 1 | 2
  isCreating: boolean
  onClose: () => void
  onCreate: (payload: CreateAdvancePaymentPayload) => Promise<unknown>
}

export const CreateAdvancePaymentModal: React.FC<CreateAdvancePaymentModalProps> = ({
  open,
  year,
  defaultPeriodMonthsCount,
  isCreating,
  onClose,
  onCreate,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAdvancePaymentFormValues>({
    resolver: zodResolver(createAdvancePaymentSchema),
    defaultValues: CREATE_ADVANCE_PAYMENT_DEFAULTS,
  })
  const periodMonthsCount = watch('period_months_count')
  const month = watch('month')
  const turnoverAmount = watch('turnover_amount')
  const advanceRate = watch('advance_rate')
  const monthOptions = getAdvancePaymentMonthOptions(periodMonthsCount)

  const liveCalculated =
    turnoverAmount != null && advanceRate != null && turnoverAmount >= 0 && advanceRate >= 0
      ? calcAdvanceAmount(turnoverAmount, advanceRate)
      : null

  useEffect(() => {
    if (!open || defaultPeriodMonthsCount == null) return
    setValue('period_months_count', defaultPeriodMonthsCount, { shouldValidate: true })
  }, [defaultPeriodMonthsCount, open, setValue])

  useEffect(() => {
    if (periodMonthsCount !== 2) return
    const nextMonth = getValidBimonthlyMonth(month)
    if (nextMonth === month) return
    setValue('month', nextMonth, { shouldValidate: true })
  }, [month, periodMonthsCount, setValue])

  const handleClose = () => {
    reset(CREATE_ADVANCE_PAYMENT_DEFAULTS)
    onClose()
  }

  const onSubmit = handleSubmit(async (data) => {
    await onCreate(buildCreateAdvancePaymentPayload(year, data))
    reset(CREATE_ADVANCE_PAYMENT_DEFAULTS)
    onClose()
  })

  return (
    <Modal
      open={open}
      title="מקדמה חדשה"
      onClose={handleClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            ביטול
          </Button>
          <Button variant="primary" isLoading={isCreating} onClick={onSubmit}>
            יצירה
          </Button>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Controller
          name="month"
          control={control}
          render={({ field }) => (
            <Select
              label="חודש"
              value={String(field.value)}
              onChange={(e) => field.onChange(Number(e.target.value))}
              options={monthOptions}
              error={errors.month?.message}
            />
          )}
        />
        <Controller
          name="period_months_count"
          control={control}
          render={({ field }) => (
            <Select
              label="תדירות מקדמות"
              value={String(field.value)}
              onChange={(e) => field.onChange(toFrequency(e.target.value))}
              options={ADVANCE_PAYMENT_FREQUENCY_OPTIONS}
              disabled={defaultPeriodMonthsCount != null}
            />
          )}
        />
        {(
          [
            { name: 'turnover_amount', label: 'מחזור לתקופה (אופציונלי)' },
            { name: 'advance_rate', label: 'אחוז מקדמה (%) (אופציונלי)' },
          ] as const
        ).map(({ name, label }) => (
          <Controller
            key={name}
            name={name}
            control={control}
            render={({ field }) => (
              <Input
                label={label}
                type="number"
                min={0}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(toNumberOrNull(e.target.value))}
                error={errors[name]?.message}
              />
            )}
          />
        ))}
        {liveCalculated != null && (
          <div>
            <div className="text-xs text-gray-500 mb-1">סכום מחושב</div>
            <div className="text-sm font-medium text-gray-800">{formatShekelAmount(liveCalculated)}</div>
          </div>
        )}
        {(
          [
            { name: 'override_amount', label: 'סכום עקיפה (אופציונלי)' },
            { name: 'paid_amount', label: 'סכום ששולם (אופציונלי)' },
          ] as const
        ).map(({ name, label }) => (
          <Controller
            key={name}
            name={name}
            control={control}
            render={({ field }) => (
              <Input
                label={label}
                type="number"
                min={0}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(toNumberOrNull(e.target.value))}
                error={errors[name]?.message}
              />
            )}
          />
        ))}
        <div className="space-y-1">
          <label htmlFor="create-advance-payment-notes" className="block text-sm font-medium text-gray-700">
            הערות (אופציונלי)
          </label>
          <textarea
            {...register('notes')}
            id="create-advance-payment-notes"
            rows={2}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="הערות..."
          />
        </div>
      </form>
    </Modal>
  )
}

CreateAdvancePaymentModal.displayName = 'CreateAdvancePaymentModal'
