import { StatsCard } from '@/components/ui/layout/StatsCard'

interface ClientsStatsSectionProps {
  stats: { osek_patur: number; osek_murshe: number; company_ltd: number; employee: number }
  selectedEntityType: string | undefined
  onEntityTypeClick: (entityType: string) => void
}

export const ClientsStatsSection = ({ stats, selectedEntityType, onEntityTypeClick }: ClientsStatsSectionProps) => {
  const entityTypeCards = [
    {
      key: 'osek_patur',
      label: 'עוסק פטור',
      count: stats.osek_patur,
      description: 'לקוחות המוגדרים כעוסק פטור',
      variant: 'green' as const,
    },
    {
      key: 'osek_murshe',
      label: 'עוסק מורשה',
      count: stats.osek_murshe,
      description: 'לקוחות המוגדרים כעוסק מורשה',
      variant: 'blue' as const,
    },
    {
      key: 'company_ltd',
      label: 'חברה בע״מ',
      count: stats.company_ltd,
      description: 'לקוחות המוגדרים כחברה בע״מ',
      variant: 'purple' as const,
    },
    {
      key: 'employee',
      label: 'שכיר',
      count: stats.employee,
      description: 'לקוחות המוגדרים כשכירים',
      variant: 'neutral' as const,
    },
  ] as const

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {entityTypeCards.map((card) => (
        <StatsCard
          key={card.key}
          title={card.label}
          value={card.count}
          description={card.description}
          variant={card.variant}
          selected={selectedEntityType === card.key}
          onClick={() => onEntityTypeClick(card.key)}
        />
      ))}
    </div>
  )
}

ClientsStatsSection.displayName = 'ClientsStatsSection'
