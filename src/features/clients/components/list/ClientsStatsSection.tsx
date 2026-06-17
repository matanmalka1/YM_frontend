import { StatsCard } from '@/components/ui/layout/StatsCard'

interface ClientsStatsSectionProps {
  stats: { active: number; frozen: number; closed: number }
  selectedStatus: string | undefined
  onStatusClick: (status: string) => void
}

export const ClientsStatsSection = ({ stats, selectedStatus, onStatusClick }: ClientsStatsSectionProps) => {
  const statusPills = [
    { key: 'active', label: 'פעילים', count: stats.active, variant: 'green' as const },
    { key: 'frozen', label: 'מוקפאים', count: stats.frozen, variant: 'orange' as const },
    { key: 'closed', label: 'סגורים', count: stats.closed, variant: 'neutral' as const },
  ] as const

  return (
    <div className="grid grid-cols-3 gap-4">
      {statusPills.map((pill) => (
        <StatsCard
          key={pill.key}
          title={pill.label}
          value={pill.count}
          variant={pill.variant}
          selected={selectedStatus === pill.key}
          onClick={() => onStatusClick(pill.key)}
        />
      ))}
    </div>
  )
}

ClientsStatsSection.displayName = 'ClientsStatsSection'
