import { StatsCard } from '@/components/ui/layout/StatsCard'
import { CLIENTS_MESSAGES } from '../../messages'

interface ClientsStatsSectionProps {
  stats: { osek_patur: number; osek_murshe: number; company_ltd: number; employee: number }
}

export const ClientsStatsSection = ({ stats }: ClientsStatsSectionProps) => {
  const entityTypeCards = [
    {
      key: 'osek_patur',
      label: CLIENTS_MESSAGES.stats.osekPaturLabel,
      count: stats.osek_patur,
      description: CLIENTS_MESSAGES.stats.osekPaturDescription,
      variant: 'positive' as const,
    },
    {
      key: 'osek_murshe',
      label: CLIENTS_MESSAGES.stats.osekMursheLabel,
      count: stats.osek_murshe,
      description: CLIENTS_MESSAGES.stats.osekMursheDescription,
      variant: 'info' as const,
    },
    {
      key: 'company_ltd',
      label: CLIENTS_MESSAGES.stats.companyLtdLabel,
      count: stats.company_ltd,
      description: CLIENTS_MESSAGES.stats.companyLtdDescription,
      variant: 'purple' as const,
    },
    {
      key: 'employee',
      label: CLIENTS_MESSAGES.stats.employeeLabel,
      count: stats.employee,
      description: CLIENTS_MESSAGES.stats.employeeDescription,
      variant: 'neutral' as const,
    },
  ] as const

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {entityTypeCards.map((card) => (
        <StatsCard key={card.key} title={card.label} value={card.count} description={card.description} variant={card.variant} />
      ))}
    </div>
  )
}

ClientsStatsSection.displayName = 'ClientsStatsSection'
