import { Archive, CheckCircle2, FolderKanban, Undo2 } from 'lucide-react'
import { StatsCard } from '@/components/ui/layout/StatsCard'
import type { BinderListCounters } from '../../types'
import { BINDERS_MESSAGES } from '../../messages'

interface BindersStatsSectionProps {
  counters: BinderListCounters
  countersLoading?: boolean
}

export const BindersStatsSection = ({ counters, countersLoading = false }: BindersStatsSectionProps) => {
  const statusPills = [
    {
      key: '',
      label: BINDERS_MESSAGES.stats.totalLabel,
      count: counters.total,
      icon: FolderKanban,
      variant: 'blue' as const,
      description: BINDERS_MESSAGES.stats.totalDescription,
    },
    {
      key: 'in_office',
      label: BINDERS_MESSAGES.stats.inOfficeLabel,
      count: counters.location_in_office,
      icon: Archive,
      variant: 'orange' as const,
      description: BINDERS_MESSAGES.stats.inOfficeDescription,
    },
    {
      key: 'ready_for_handover',
      label: BINDERS_MESSAGES.stats.readyLabel,
      count: counters.location_ready_for_handover,
      icon: CheckCircle2,
      variant: 'green' as const,
      description: BINDERS_MESSAGES.stats.readyDescription,
    },
    {
      key: 'handed_over',
      label: BINDERS_MESSAGES.stats.handedOverLabel,
      count: counters.location_handed_over,
      icon: Undo2,
      variant: 'neutral' as const,
      description: BINDERS_MESSAGES.stats.handedOverDescription,
    },
  ] as const

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {statusPills.map((pill) => (
        <StatsCard
          key={pill.key || 'total'}
          title={pill.label}
          value={pill.count}
          description={pill.description}
          loading={countersLoading}
          icon={pill.icon}
          variant={pill.variant}
          className="h-full w-full text-right"
        />
      ))}
    </div>
  )
}

BindersStatsSection.displayName = 'BindersStatsSection'
