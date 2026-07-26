import { CalendarRange } from 'lucide-react'
import { DefinitionList } from '@/components/ui/layout/DefinitionList'
import { Alert } from '@/components/ui/overlays/Alert'
import { Card } from '@/components/ui/primitives/Card'
import { IconChip } from '@/components/ui/primitives/IconChip'
import { SkeletonBlock } from '@/components/ui/primitives/SkeletonBlock'
import { formatShekelAmount } from '@/utils/utils'
import type { AnnualKPIResponse } from '../../api/contracts'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface AdvancePaymentAnnualContextCardProps {
  year: number
  data: AnnualKPIResponse | null
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

export const AdvancePaymentAnnualContextCard: React.FC<AdvancePaymentAnnualContextCardProps> = ({
  year,
  data,
  isLoading,
  error,
  onRetry,
}) => {
  const balance = data ? Math.max(Number(data.total_expected) - Number(data.total_paid), 0) : null

  return (
    <Card
      title={ADVANCED_PAYMENTS_MESSAGES.detail.annualContextTitle(year)}
      icon={<IconChip icon={CalendarRange} tone="info" size="sm" />}
      size="compact"
      variant="outlined"
    >
      {isLoading ? (
        <div className="space-y-4" aria-label={ADVANCED_PAYMENTS_MESSAGES.detail.annualContextLoading}>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonBlock height="h-3" width="w-1/3" />
              <SkeletonBlock height="h-5" width="w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <Alert variant="error" size="sm" message={error} onRetry={onRetry} />
      ) : data && balance != null ? (
        <DefinitionList
          layout="stacked"
          items={[
            {
              label: ADVANCED_PAYMENTS_MESSAGES.detail.annualExpectedLabel,
              value: formatShekelAmount(data.total_expected),
            },
            {
              label: ADVANCED_PAYMENTS_MESSAGES.detail.annualPaidLabel,
              value: formatShekelAmount(data.total_paid),
            },
            {
              label: ADVANCED_PAYMENTS_MESSAGES.detail.annualBalanceLabel,
              value: (
                <span className={balance > 0 ? 'text-negative-600' : 'text-positive-600'}>{formatShekelAmount(balance)}</span>
              ),
            },
          ]}
        />
      ) : null}
    </Card>
  )
}

AdvancePaymentAnnualContextCard.displayName = 'AdvancePaymentAnnualContextCard'
