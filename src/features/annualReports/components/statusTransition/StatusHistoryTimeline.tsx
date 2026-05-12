import { Clock, ArrowLeft } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { he } from 'date-fns/locale'
import { Card } from '../../../../components/ui/primitives/Card'
import { Badge } from '../../../../components/ui/primitives/Badge'
import type { StatusHistoryEntry } from '../../api'
import { getStatusLabel, getStatusVariant } from '../../api'
import { staggerDelay } from '../../../../utils/animation'

interface StatusHistoryTimelineProps {
  history: StatusHistoryEntry[]
}

export const StatusHistoryTimeline: React.FC<StatusHistoryTimelineProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <Card title="היסטוריית סטטוס">
        <p className="text-sm text-gray-500">אין רשומות היסטוריה</p>
      </Card>
    )
  }

  const reversed = [...history].reverse()

  return (
    <Card title="היסטוריית סטטוס" subtitle={`${history.length} שינויים`}>
      <div className="relative">
        <div className="absolute right-4 top-2 bottom-2 w-0.5 bg-gray-200" />
        <ul className="space-y-4">
          {reversed.map((entry, index) => (
            <li
              key={entry.id}
              className="relative pr-10 animate-fade-in"
              style={{ animationDelay: staggerDelay(index, 40) }}
            >
              <div className="absolute right-2.5 top-1.5 h-3 w-3 rounded-full bg-primary-500 ring-2 ring-white" />
              <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-1 flex flex-wrap items-center gap-1.5 text-sm">
                  {entry.from_status && (
                    <>
                      <Badge variant={getStatusVariant(entry.from_status)}>{getStatusLabel(entry.from_status)}</Badge>
                      <ArrowLeft className="h-3 w-3 text-gray-400" />
                    </>
                  )}
                  <Badge variant={getStatusVariant(entry.to_status)}>{getStatusLabel(entry.to_status)}</Badge>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">משתמש #{entry.changed_by}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(parseISO(entry.occurred_at), 'd MMM yyyy HH:mm', { locale: he })}
                  </div>
                </div>

                {entry.note && (
                  <p className="mt-1.5 text-xs text-gray-600 border-t border-gray-100 pt-1.5">{entry.note}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
