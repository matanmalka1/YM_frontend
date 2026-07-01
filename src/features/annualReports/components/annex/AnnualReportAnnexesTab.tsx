import { Card } from '../../../../components/ui/primitives/Card'
import type { ScheduleEntry, AnnualReportScheduleKey } from '../../api'
import { ANNEX_TEXT } from '../../constants/annexTextConstants'
import { getCompletedCount } from '../../utils/annexHelpers'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'
import { AnnexCard } from './AnnexCard'
import { ScheduleAddForm } from './ScheduleAddForm'

interface AnnualReportAnnexesTabProps {
  reportId: number
  schedules: ScheduleEntry[]
  onScheduleComplete: (schedule: AnnualReportScheduleKey) => void
  onScheduleAdd: (schedule: AnnualReportScheduleKey, notes?: string) => void
  isScheduleLoading: boolean
  isScheduleAdding: boolean
  completingKey?: AnnualReportScheduleKey | null
}

export const AnnualReportAnnexesTab: React.FC<AnnualReportAnnexesTabProps> = ({
  reportId,
  schedules,
  onScheduleComplete,
  onScheduleAdd,
  isScheduleLoading,
  isScheduleAdding,
  completingKey,
}) => {
  if (schedules.length === 0) {
    return (
      <Card title={ANNEX_TEXT.schedules} size="compact">
        <p className="text-sm text-gray-500">{ANNEX_TEXT.empty}</p>
        <div className="mt-3">
          <ScheduleAddForm schedules={schedules} onAdd={onScheduleAdd} isAdding={isScheduleAdding} />
        </div>
      </Card>
    )
  }

  const completed = getCompletedCount(schedules)
  const allDone = completed === schedules.length

  return (
    <Card
      title={ANNEX_TEXT.requiredSchedules}
      size="compact"
      subtitle={
        allDone
          ? ANNEX_TEXT.allSchedulesComplete
          : ANNUAL_REPORTS_MESSAGES.scheduleChecklist.completionSummary(completed, schedules.length)
      }
    >
      <ul className="space-y-2">
        {schedules.map((entry) => (
          <AnnexCard
            key={entry.id}
            reportId={reportId}
            entry={entry}
            onComplete={onScheduleComplete}
            isCompleting={isScheduleLoading && (completingKey == null || completingKey === entry.schedule)}
          />
        ))}
      </ul>
      <div className="mt-3">
        <ScheduleAddForm schedules={schedules} onAdd={onScheduleAdd} isAdding={isScheduleAdding} />
      </div>
    </Card>
  )
}

AnnualReportAnnexesTab.displayName = 'AnnualReportAnnexesTab'
