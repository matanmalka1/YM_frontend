import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/overlays/Modal'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { Button } from '@/components/ui/primitives/Button'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'
import { getAdvancePaymentMonthOptions, getForwardLookingYearOptions } from '../../utils/advancePaymentComponentUtils'
import type { BulkRateUpdatePayload } from '../../api/contracts'

const MAX_ADVANCE_RATE = 100

interface AdvanceRateChangeModalProps {
  open: boolean
  periodMonthsCount: 1 | 2
  currentRate: number | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (payload: BulkRateUpdatePayload) => void
}

export const AdvanceRateChangeModal: React.FC<AdvanceRateChangeModalProps> = ({
  open,
  periodMonthsCount,
  currentRate,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [rate, setRate] = useState('')
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')

  // Clear the inputs each time the modal opens — the caller closes it on success
  // without unmounting, so stale values would otherwise linger on reopen.
  useEffect(() => {
    if (open) {
      setRate('')
      setYear('')
      setMonth('')
    }
  }, [open])

  const yearOptions = getForwardLookingYearOptions()
  const monthOptions = getAdvancePaymentMonthOptions(periodMonthsCount)
  const numericRate = Number(rate)
  const isValidRate = rate.trim() !== '' && Number.isFinite(numericRate) && numericRate >= 0 && numericRate <= MAX_ADVANCE_RATE
  const isValid = isValidRate && year !== '' && month !== ''

  const handleSubmit = () => {
    if (!isValid) return
    onSubmit({ advance_rate: rate.trim(), from_period: `${year}-${String(month).padStart(2, '0')}` })
  }

  return (
    <Modal
      open={open}
      title={ADVANCED_PAYMENTS_MESSAGES.bulkRateUpdate.modalTitle}
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" disabled={isSubmitting} onClick={onClose}>
            {GLOBAL_UI_MESSAGES.actions.cancel}
          </Button>
          <Button variant="primary" isLoading={isSubmitting} disabled={!isValid || isSubmitting} onClick={handleSubmit}>
            {ADVANCED_PAYMENTS_MESSAGES.bulkRateUpdate.confirmButton}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm leading-6 text-gray-600">
          {ADVANCED_PAYMENTS_MESSAGES.bulkRateUpdate.description(currentRate)}
        </p>
        <Input
          label={ADVANCED_PAYMENTS_MESSAGES.bulkRateUpdate.rateLabel}
          type="number"
          min={0}
          max={MAX_ADVANCE_RATE}
          step="0.01"
          value={rate}
          onChange={(event) => setRate(event.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label={ADVANCED_PAYMENTS_MESSAGES.bulkRateUpdate.fromYearLabel}
            placeholder={ADVANCED_PAYMENTS_MESSAGES.bulkRateUpdate.fromPeriodPlaceholder}
            options={yearOptions}
            value={year}
            onChange={(event) => setYear(event.target.value)}
          />
          <Select
            label={ADVANCED_PAYMENTS_MESSAGES.bulkRateUpdate.fromMonthLabel}
            placeholder={ADVANCED_PAYMENTS_MESSAGES.bulkRateUpdate.fromPeriodPlaceholder}
            options={monthOptions}
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
        </div>
      </div>
    </Modal>
  )
}
