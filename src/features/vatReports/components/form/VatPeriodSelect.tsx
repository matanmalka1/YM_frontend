import { useMemo } from 'react'
import { Select } from '@/components/ui/inputs/Select'
import { useVatPeriodOptions } from '../../hooks/useVatPeriodOptions'
import { VAT_MESSAGES } from '../../messages'

interface VatPeriodSelectProps {
  clientId: number
  year: number
  value: string
  onChange: (value: string) => void
  error?: string
  className?: string
  enabled?: boolean
}

export const VatPeriodSelect: React.FC<VatPeriodSelectProps> = ({
  clientId,
  year,
  value,
  onChange,
  error,
  className,
  enabled = true,
}) => {
  const { isValidClient, periodOptions, periodType, isLoading } = useVatPeriodOptions(clientId, year, enabled)
  const selectedPeriodExists = !value || periodOptions.some((opt) => opt.period === value)

  const options = useMemo(
    () => [
      {
        value: '',
        label: !isValidClient
          ? VAT_MESSAGES.periodSelect.chooseClientFirst
          : isLoading
            ? VAT_MESSAGES.periodSelect.loadingPeriods
            : VAT_MESSAGES.periodSelect.choosePeriod,
      },
      ...periodOptions.map((opt) => ({
        value: opt.period,
        label: opt.is_opened ? VAT_MESSAGES.periodSelect.existingWorkItemSuffix(opt.label) : opt.label,
        disabled: opt.is_opened,
      })),
    ],
    [isValidClient, isLoading, periodOptions],
  )

  const combinedError = error || (!selectedPeriodExists ? VAT_MESSAGES.periodSelect.unavailablePeriod : undefined)

  return (
    <>
      <Select
        label={VAT_MESSAGES.periodSelect.reportingPeriodLabel}
        error={combinedError}
        fieldClassName={className}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={options}
        disabled={!isValidClient || isLoading}
      />
      {periodType === 'bimonthly' && (
        <p className={`text-xs text-gray-500 ${className ?? ''}`}>{VAT_MESSAGES.periodSelect.bimonthlyClient}</p>
      )}
      {!isLoading && isValidClient && periodOptions.length === 0 && (
        <p className={`text-xs text-gray-500 ${className ?? ''}`}>{VAT_MESSAGES.periodSelect.noAvailablePeriods}</p>
      )}
    </>
  )
}

VatPeriodSelect.displayName = 'VatPeriodSelect'
