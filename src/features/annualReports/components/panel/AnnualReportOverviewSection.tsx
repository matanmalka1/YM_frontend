import { useState } from 'react'
import { ChevronDown, ChevronUp, BarChart3 } from 'lucide-react'
import { Button } from '../../../../components/ui/primitives/Button'
import { Card } from '../../../../components/ui/primitives/Card'
import { ReportAlertBanners } from './ReportAlertBanners'
import { AnnualReportStatsSection } from './AnnualReportStatsSection'
import { ReportMetaGrid } from './ReportMetaGrid'
import { AnnualReportDetailForm } from '../tax/AnnualReportDetailForm'
import { ScheduleChecklist } from '../annex/ScheduleChecklist'
import { AnnualPLSummary } from '../financials/AnnualPLSummary'
import type { AnnualReportDetail } from '../../types'
import type { AnnualReportFull, AnnualReportScheduleKey, ScheduleEntry } from '../../api'

interface Props {
  report: AnnualReportFull
  detail: AnnualReportDetail | null
  advances?: { balance_type: 'due' | 'refund' | 'zero'; final_balance: number }
  schedules: ScheduleEntry[]
  onDetailSave: (data: Partial<AnnualReportDetail>) => void
  isSaving: boolean
  onScheduleComplete: (schedule: AnnualReportScheduleKey) => void
  onScheduleAdd: (schedule: AnnualReportScheduleKey, notes?: string) => void
  isScheduleLoading: boolean
  isScheduleAdding: boolean
  completingKey?: AnnualReportScheduleKey | null
  clientId: number
  onDirtyChange?: (dirty: boolean) => void
  submitRef?: React.RefObject<(() => void) | null>
}

export const AnnualReportOverviewSection: React.FC<Props> = ({
  report,
  detail,
  advances,
  schedules,
  onDetailSave,
  isSaving,
  onScheduleComplete,
  onScheduleAdd,
  isScheduleLoading,
  isScheduleAdding,
  completingKey,
  clientId,
  onDirtyChange,
  submitRef,
}) => {
  const [plExpanded, setPlExpanded] = useState(false)

  return (
    <div className="space-y-6">
      <ReportAlertBanners report={report} advances={advances} />

      <AnnualReportStatsSection report={report} />

      {/* Meta + detail form */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="פרטי הדוח" size="compact">
          <ReportMetaGrid report={report} />
        </Card>
        <Card title="עדכון נתונים" size="compact">
          <AnnualReportDetailForm
            detail={detail}
            onSave={onDetailSave}
            isSaving={isSaving}
            onDirtyChange={onDirtyChange}
            submitRef={submitRef}
          />
        </Card>
      </div>

      <ScheduleChecklist
        reportId={report.id}
        schedules={schedules}
        onComplete={onScheduleComplete}
        onAdd={onScheduleAdd}
        isLoading={isScheduleLoading}
        isAdding={isScheduleAdding}
        completingKey={completingKey}
      />

      {/* P&L collapsible */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setPlExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-none"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gray-400" />
            <span>סיכום רווח והפסד</span>
          </div>
          {plExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </Button>
        {plExpanded && (
          <div className="border-t border-gray-100 px-5 pb-5 pt-4">
            <AnnualPLSummary reportId={report.id} clientId={clientId} />
          </div>
        )}
      </div>
    </div>
  )
}

AnnualReportOverviewSection.displayName = 'AnnualReportOverviewSection'
