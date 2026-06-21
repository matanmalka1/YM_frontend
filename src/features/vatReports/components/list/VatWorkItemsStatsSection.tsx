import { CheckCircle2, Clock, FileText, Hourglass } from 'lucide-react'
import { StatsCard } from '@/components/ui/layout/StatsCard'

interface VatWorkItemsStatsSectionProps {
  stats: {
    pending: number
    typing: number
    review: number
    filed: number
  }
}

export const VatWorkItemsStatsSection = ({ stats }: VatWorkItemsStatsSectionProps) => {
  const statCards = [
    {
      key: 'pending',
      title: 'ממתין לחומרים',
      value: stats.pending,
      icon: Hourglass,
      variant: 'orange' as const,
      description: 'דורשים מסמכים מהלקוח',
    },
    {
      key: 'typing',
      title: 'בהקלדה',
      value: stats.typing,
      icon: Clock,
      variant: 'blue' as const,
      description: 'דוחות שנמצאים בטיפול',
    },
    {
      key: 'review',
      title: 'ממתין לבדיקה',
      value: stats.review,
      icon: FileText,
      variant: 'orange' as const,
      description: 'מוכנים לאישור ולהגשה',
    },
    {
      key: 'filed',
      title: 'הוגש',
      value: stats.filed,
      icon: CheckCircle2,
      variant: 'green' as const,
      description: 'דוחות שהוגשו לרשות המסים',
    },
  ] as const

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {statCards.map((card) => (
        <StatsCard
          key={card.key}
          title={card.title}
          value={card.value}
          icon={card.icon}
          variant={card.variant}
          description={card.description}
        />
      ))}
    </div>
  )
}

VatWorkItemsStatsSection.displayName = 'VatWorkItemsStatsSection'
