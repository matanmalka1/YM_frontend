import { useMemo } from 'react'
import { Select } from '@/components/ui/inputs/Select'
import { useVatPeriodOptions } from '../../hooks/useVatPeriodOptions'

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
        label: !isValidClient ? 'בחר לקוח תחילה' : isLoading ? 'טוען תקופות...' : 'בחר תקופה...',
      },
      ...periodOptions.map((opt) => ({
        value: opt.period,
        label: `${opt.label}${opt.is_opened ? ' (קיים תיק)' : ''}`,
        disabled: opt.is_opened,
      })),
    ],
    [isValidClient, isLoading, periodOptions],
  )

  const combinedError = error || (!selectedPeriodExists ? 'התקופה שנבחרה אינה זמינה ללקוח זה' : undefined)

  return (
    <>
      <Select
        label="תקופת דיווח *"
        error={combinedError}
        fieldClassName={className}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={options}
        disabled={!isValidClient || isLoading}
      />
      {periodType === 'bimonthly' && (
        <p className={`text-xs text-gray-500 ${className ?? ''}`}>הלקוח מוגדר לדיווח דו-חודשי</p>
      )}
      {!isLoading && isValidClient && periodOptions.length === 0 && (
        <p className={`text-xs text-gray-500 ${className ?? ''}`}>לא נמצאו תקופות זמינות לשנה זו</p>
      )}
    </>
  )
}

VatPeriodSelect.displayName = 'VatPeriodSelect'
