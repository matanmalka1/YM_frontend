import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Modal } from '../../../components/ui/overlays/Modal'
import { Input } from '../../../components/ui/inputs/Input'
import { Button } from '../../../components/ui/primitives/Button'
import { Select } from '../../../components/ui/inputs/Select'
import {
  createAdvancePaymentSchema,
  CREATE_ADVANCE_PAYMENT_DEFAULTS,
  type CreateAdvancePaymentFormValues,
} from '../schemas'
import { ADVANCE_PAYMENT_FREQUENCY_OPTIONS } from '../constants'
import { advancePaymentsApi, advancedPaymentsQK } from '../api'
import type { CreateAdvancePaymentPayload } from '../types'
import {
  buildCreateAdvancePaymentPayload,
  formatSuggestionAmount,
  getAdvancePaymentMonthOptions,
  getValidBimonthlyMonth,
  toFrequency,
  toNumberOrNull,
} from './advancePaymentComponent.utils'
import { formatShekelAmount } from '@/utils/utils'
import { ADVANCE_PAYMENT_SUGGESTION_STALE_TIME_MS, NOTES_TEXTAREA_CLASS } from './advancePaymentComponent.constants'

interface CreateAdvancePaymentModalProps {
  open: boolean
  clientId: number
  year: number
  defaultPeriodMonthsCount?: 1 | 2
  isCreating: boolean
  onClose: () => void
  onCreate: (payload: CreateAdvancePaymentPayload) => Promise<unknown>
}

export const CreateAdvancePaymentModal: React.FC<CreateAdvancePaymentModalProps> = ({
  open,
  clientId,
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
      ? ((turnoverAmount * advanceRate) / 100).toFixed(2)
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

  const { data: suggestion } = useQuery({
    queryKey: advancedPaymentsQK.suggestion(clientId, year, periodMonthsCount),
    queryFn: () => advancePaymentsApi.getSuggestion(clientId, year, periodMonthsCount),
    enabled: open && clientId > 0 && year > 0,
    staleTime: ADVANCE_PAYMENT_SUGGESTION_STALE_TIME_MS,
  })

  const handleClose = () => {
    reset(CREATE_ADVANCE_PAYMENT_DEFAULTS)
    onClose()
  }

  const onSubmit = handleSubmit(async (data) => {
    await onCreate(buildCreateAdvancePaymentPayload(year, data))
    reset(CREATE_ADVANCE_PAYMENT_DEFAULTS)
    onClose()
  })

  const applySuggestion = () => {
    if (suggestion?.suggested_amount != null) {
      setValue('override_amount', Number(suggestion.suggested_amount), { shouldValidate: true })
    }
  }

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
            />
          )}
        />
        <Controller
          name="turnover_amount"
          control={control}
          render={({ field }) => (
            <Input
              label="מחזור לתקופה (אופציונלי)"
              type="number"
              min={0}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(toNumberOrNull(e.target.value))}
              error={errors.turnover_amount?.message}
            />
          )}
        />
        <Controller
          name="advance_rate"
          control={control}
          render={({ field }) => (
            <Input
              label="אחוז מקדמה (%) (אופציונלי)"
              type="number"
              min={0}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(toNumberOrNull(e.target.value))}
              error={errors.advance_rate?.message}
            />
          )}
        />
        {liveCalculated != null && (
          <div>
            <div className="text-xs text-gray-500 mb-1">סכום מחושב</div>
            <div className="text-sm font-medium text-gray-800">{formatShekelAmount(liveCalculated)}</div>
          </div>
        )}
        <Controller
          name="override_amount"
          control={control}
          render={({ field }) => (
            <div className="space-y-1">
              <Input
                label="סכום עקיפה (אופציונלי)"
                type="number"
                min={0}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(toNumberOrNull(e.target.value))}
                error={errors.override_amount?.message}
              />
              {suggestion?.has_data && suggestion.suggested_amount != null && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={applySuggestion}
                  className="text-sm text-primary-600 hover:underline text-right w-full px-0 hover:bg-transparent justify-end"
                >
                  הצעה לפי מחזור שנה קודמת: ₪{formatSuggestionAmount(suggestion.suggested_amount)} — לחץ למילוי
                </Button>
              )}
            </div>
          )}
        />
        <Controller
          name="paid_amount"
          control={control}
          render={({ field }) => (
            <Input
              label="סכום ששולם (אופציונלי)"
              type="number"
              min={0}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(toNumberOrNull(e.target.value))}
              error={errors.paid_amount?.message}
            />
          )}
        />
        <div className="space-y-1">
          <label htmlFor="create-advance-payment-notes" className="block text-sm font-medium text-gray-700">
            הערות (אופציונלי)
          </label>
          <textarea
            {...register('notes')}
            id="create-advance-payment-notes"
            rows={2}
            className={NOTES_TEXTAREA_CLASS}
            placeholder="הערות..."
          />
        </div>
      </form>
    </Modal>
  )
}

CreateAdvancePaymentModal.displayName = 'CreateAdvancePaymentModal'
