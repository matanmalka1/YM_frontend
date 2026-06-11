import { useQuery } from '@tanstack/react-query'
import { Clock, ArrowRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { he } from 'date-fns/locale'
import { Card } from '@/components/ui/primitives/Card'
import { Badge } from '@/components/ui/primitives/Badge'
import { Timeline, TimelineEntry } from '@/components/ui/feedback/Timeline'
import { bindersApi, bindersQK } from '../../api'
import {
  BINDER_CAPACITY_STATUS_VARIANTS,
  BINDER_LOCATION_STATUS_VARIANTS,
  getBinderCapacityStatusLabel,
  getBinderLocationStatusLabel,
  type BinderCapacityStatusValue,
  type BinderLocationStatusValue,
} from '../../constants'
import { staggerDelay } from '@/utils/animation'

interface BinderAuditSectionProps {
  binderId: number
}

const getAuditBadge = (fieldName: string, value: string) => {
  if (fieldName === 'capacity_status') {
    return {
      label: getBinderCapacityStatusLabel(value),
      variant: BINDER_CAPACITY_STATUS_VARIANTS[value as BinderCapacityStatusValue] ?? 'neutral',
    }
  }
  return {
    label: getBinderLocationStatusLabel(value),
    variant: BINDER_LOCATION_STATUS_VARIANTS[value as BinderLocationStatusValue] ?? 'neutral',
  }
}

export const BinderAuditSection: React.FC<BinderAuditSectionProps> = ({ binderId }) => {
  const { data, isLoading } = useQuery({
    queryKey: bindersQK.audit(binderId),
    queryFn: () => bindersApi.getAudit(binderId),
  })

  const audit = data?.audit ?? []

  if (isLoading) return null

  return (
    <Card title="היסטוריית שינויים" subtitle={audit.length ? `${audit.length} שינויים` : undefined}>
      {audit.length === 0 ? (
        <p className="text-sm text-gray-500">אין רשומות היסטוריה</p>
      ) : (
        <Timeline>
          {[...audit].reverse().map((entry, index) => {
            const oldBadge = entry.old_value ? getAuditBadge(entry.field_name, entry.old_value) : null
            const newBadge = getAuditBadge(entry.field_name, entry.new_value)
            return (
              <TimelineEntry key={index} animationDelay={staggerDelay(index, 40)}>
                <div className="mb-1 flex flex-wrap items-center gap-1.5 text-sm">
                  {entry.old_value && (
                    <>
                      <Badge variant={oldBadge?.variant ?? 'neutral'}>{oldBadge?.label}</Badge>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                    </>
                  )}
                  <Badge variant={newBadge.variant}>{newBadge.label}</Badge>
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
            )
          })}
        </Timeline>
      )}
    </Card>
  )
}
