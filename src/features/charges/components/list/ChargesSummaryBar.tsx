import { Clock, CheckCircle2, FileText, XCircle } from 'lucide-react'
import type { ChargeListStats } from '../../api'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import { getChargeStatusStatDisplay } from '../../utils/chargeHelpers'

interface ChargesSummaryBarProps {
  stats: ChargeListStats
  isAdvisor: boolean
  currentStatus: string
  onStatusClick: (status: string) => void
}

export const ChargesSummaryBar: React.FC<ChargesSummaryBarProps> = ({
  stats,
  isAdvisor,
  currentStatus,
  onStatusClick,
}) => {
  const handleClick = (status: string) => {
    onStatusClick(currentStatus === status ? '' : status)
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatsCard
        title="ממתין לגביה"
        value={getChargeStatusStatDisplay(stats.issued, isAdvisor)}
        icon={Clock}
        variant="blue"
        selected={currentStatus === 'issued'}
        onClick={() => handleClick('issued')}
      />
      <StatsCard
        title="שולם"
        value={getChargeStatusStatDisplay(stats.paid, isAdvisor)}
        icon={CheckCircle2}
        variant="green"
        selected={currentStatus === 'paid'}
        onClick={() => handleClick('paid')}
      />
      <StatsCard
        title="טיוטה"
        value={getChargeStatusStatDisplay(stats.draft, isAdvisor)}
        icon={FileText}
        variant="neutral"
        selected={currentStatus === 'draft'}
        onClick={() => handleClick('draft')}
      />
      <StatsCard
        title="בוטל"
        value={getChargeStatusStatDisplay(stats.canceled, isAdvisor)}
        icon={XCircle}
        variant="red"
        selected={currentStatus === 'canceled'}
        onClick={() => handleClick('canceled')}
      />
    </div>
  )
}

ChargesSummaryBar.displayName = 'ChargesSummaryBar'
