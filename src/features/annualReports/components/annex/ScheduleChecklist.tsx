import { useState } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react'
import { Card } from '../../../../components/ui/primitives/Card'
import { Button } from '../../../../components/ui/primitives/Button'
import type { ScheduleEntry, AnnualReportScheduleKey } from '../../api'
import { getScheduleLabel } from '../../api'
import { cn, formatDate } from '../../../../utils/utils'
import { AnnexDataPanel } from './AnnexDataPanel'
import { ScheduleAddForm } from './ScheduleAddForm'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import { ANNEX_TEXT } from '../../constants/annexTextConstants'
import { getCompletedCount, toggleExpandedSchedule } from '../../utils/annexHelpers'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

interface ScheduleChecklistProps {
  reportId: number
  schedules: ScheduleEntry[]
  onComplete: (schedule: AnnualReportScheduleKey) => void
  onAdd: (schedule: AnnualReportScheduleKey, notes?: string) => void
  isLoading: boolean
  isAdding: boolean
  completingKey?: AnnualReportScheduleKey | null
}

export const ScheduleChecklist: React.FC<ScheduleChecklistProps> = ({
  reportId,
  schedules,
  onComplete,
  onAdd,
  isLoading,
  isAdding,
  completingKey,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  if (schedules.length === 0) {
    return (
      <Card title={ANNEX_TEXT.schedules}>
        <p className="text-sm text-gray-500">{ANNEX_TEXT.empty}</p>
        <div className="mt-3">
          <ScheduleAddForm schedules={schedules} onAdd={onAdd} isAdding={isAdding} />
        </div>
      </Card>
    )
  }

  const completed = getCompletedCount(schedules)
  const allDone = completed === schedules.length

  const toggle = (key: string) => setExpanded((prev) => toggleExpandedSchedule(prev, key as AnnualReportScheduleKey))

  return (
    <Card
      title={ANNEX_TEXT.requiredSchedules}
      subtitle={allDone ? ANNEX_TEXT.allSchedulesComplete : ANNUAL_REPORTS_MESSAGES.scheduleChecklist.completionSummary(completed, schedules.length)}
    >
      <ul className="space-y-2">
        {schedules.map((entry) => {
          const isExpanded = !!expanded[entry.schedule]
          const scheduleLabel = getScheduleLabel(entry.schedule)

          return (
            <li
              key={entry.id}
              className={cn(
                'rounded-lg border transition-colors',
                entry.is_complete ? 'border-positive-200 bg-positive-50' : 'border-gray-200 bg-white hover:bg-gray-50',
              )}
            >
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  {entry.is_complete ? (
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-positive-600" />
                  ) : (
                    <Circle className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  )}
                  <div>
                    <p className={cn('text-sm font-medium', entry.is_complete ? 'text-positive-800' : 'text-gray-800')}>
                      {scheduleLabel}
                    </p>
                    {entry.notes && <p className="text-xs text-gray-500">{entry.notes}</p>}
                    {entry.completed_at && (
                      <p className={cn('text-xs', semanticMonoToneClasses.positive)}>
                        {ANNUAL_REPORTS_MESSAGES.scheduleChecklist.completedAt(formatDate(entry.completed_at))}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggle(entry.schedule)}
                    className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-transparent"
                    title={isExpanded ? ANNEX_TEXT.close : ANNEX_TEXT.expandData}
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>

                  {!entry.is_complete && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onComplete(entry.schedule as AnnualReportScheduleKey)}
                      isLoading={isLoading && completingKey === entry.schedule}
                      disabled={isLoading}
                    >
                      {ANNEX_TEXT.complete}
                    </Button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 px-3 pb-3">
                  <AnnexDataPanel
                    reportId={reportId}
                    schedule={entry.schedule as AnnualReportScheduleKey}
                    scheduleLabel={scheduleLabel}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ul>
      <div className="mt-3">
        <ScheduleAddForm schedules={schedules} onAdd={onAdd} isAdding={isAdding} />
      </div>
    </Card>
  )
}

ScheduleChecklist.displayName = 'ScheduleChecklist'
