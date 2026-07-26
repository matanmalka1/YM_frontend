import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Select } from '@/components/ui/inputs/Select'
import { Button } from '@/components/ui/primitives/Button'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'
import type { AdvancePaymentPeriodOption } from '../../hooks/useAdvancePaymentPeriodNavigation'

interface AdvancePaymentPeriodNavigatorProps {
  paymentId: number
  options: AdvancePaymentPeriodOption[]
  previousPaymentId: number | null
  nextPaymentId: number | null
  isLoading: boolean
  isError: boolean
  disabled: boolean
  onNavigate: (paymentId: number) => void
}

export const AdvancePaymentPeriodNavigator = ({
  paymentId,
  options,
  previousPaymentId,
  nextPaymentId,
  isLoading,
  isError,
  disabled,
  onNavigate,
}: AdvancePaymentPeriodNavigatorProps) => {
  const navigationDisabled = disabled || isLoading || isError

  return (
    <div
      className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-end gap-2 sm:w-auto"
      aria-label={ADVANCED_PAYMENTS_MESSAGES.periodNavigation.ariaLabel}
    >
      <Button
        variant="outline"
        size="sm"
        shape="square"
        icon={<ChevronRight className="h-4 w-4" />}
        aria-label={ADVANCED_PAYMENTS_MESSAGES.periodNavigation.previous}
        tooltip={ADVANCED_PAYMENTS_MESSAGES.periodNavigation.previous}
        disabled={navigationDisabled || previousPaymentId === null}
        onClick={() => previousPaymentId !== null && onNavigate(previousPaymentId)}
      />
      <Select
        label={ADVANCED_PAYMENTS_MESSAGES.periodNavigation.pickerLabel}
        size="sm"
        fieldClassName="w-full sm:w-52"
        value={String(paymentId)}
        options={options.map((option) => ({ value: String(option.id), label: option.label }))}
        disabled={navigationDisabled}
        onChange={(event) => onNavigate(Number(event.target.value))}
      />
      <Button
        variant="outline"
        size="sm"
        shape="square"
        icon={<ChevronLeft className="h-4 w-4" />}
        aria-label={ADVANCED_PAYMENTS_MESSAGES.periodNavigation.next}
        tooltip={ADVANCED_PAYMENTS_MESSAGES.periodNavigation.next}
        disabled={navigationDisabled || nextPaymentId === null}
        onClick={() => nextPaymentId !== null && onNavigate(nextPaymentId)}
      />
      {isError && <span className="text-xs text-negative-700">{ADVANCED_PAYMENTS_MESSAGES.periodNavigation.loadError}</span>}
    </div>
  )
}

AdvancePaymentPeriodNavigator.displayName = 'AdvancePaymentPeriodNavigator'
