import { useQuery } from '@tanstack/react-query'
import { Clock, ArrowRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { he } from 'date-fns/locale'
import { Card } from '@/components/ui/primitives/Card'
import { Badge } from '@/components/ui/primitives/Badge'
import { Timeline, TimelineEntry } from '@/components/ui/feedback/Timeline'
import { bindersApi, bindersQK } from '../../api'
import { getBinderStatusLabel, BINDER_STATUS_VARIANTS, type BinderStatusValue } from '../../constants'
import { staggerDelay } from '@/utils/animation'

interface BinderHistorySectionProps {
  binderId: number
}

export const BinderHistorySection: React.FC<BinderHistorySectionProps> = ({ binderId }) => {
  const { data, isLoading } = useQuery({
    queryKey: bindersQK.history(binderId),
    queryFn: () => bindersApi.getHistory(binderId),
  })

  const history = data?.history ?? []

  if (isLoading) return null

  return (
    <Card title="היסטוריית שינויים" subtitle={history.length ? `${history.length} שינויים` : undefined}>
      {history.length === 0 ? (
        <p className="text-sm text-gray-500">אין רשומות היסטוריה</p>
      ) : (
        <Timeline>
          {[...history].reverse().map((entry, index) => (
            <TimelineEntry key={index} animationDelay={staggerDelay(index, 40)}>
              <div className="mb-1 flex flex-wrap items-center gap-1.5 text-sm">
                {entry.old_status && (
                  <>
                    <Badge variant={BINDER_STATUS_VARIANTS[entry.old_status as BinderStatusValue] ?? 'neutral'}>
                      {getBinderStatusLabel(entry.old_status)}
                    </Badge>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                  </>
                )}
                <Badge variant={BINDER_STATUS_VARIANTS[entry.new_status as BinderStatusValue] ?? 'neutral'}>
                  {getBinderStatusLabel(entry.new_status)}
                </Badge>
              </div>

              <div className="flex items-center justify-end gap-1 text-xs text-gray-500">
                {entry.changed_by_name && <span className="text-gray-600">{entry.changed_by_name}</span>}
                {entry.changed_by_name && <span>·</span>}
                <Clock className="h-3 w-3" />
                {format(parseISO(entry.changed_at), 'd MMM yyyy HH:mm', { locale: he })}
              </div>

              {entry.notes && (
                <p className="mt-1.5 text-xs text-gray-600 border-t border-gray-100 pt-1.5">{entry.notes}</p>
              )}
            </TimelineEntry>
          ))}
        </Timeline>
      )}
    </Card>
  )
}
