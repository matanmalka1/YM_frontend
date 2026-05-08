import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, BarChart3 } from 'lucide-react'
import { EntityAuditTrailSection } from '@/features/audit'
import { Button } from '../../../../components/ui/primitives/Button'
import { ReportAlertBanners } from './ReportAlertBanners'
import { ReportSummaryCards } from './ReportSummaryCards'
import { ReportMetaGrid } from './ReportMetaGrid'
import { AnnualReportDetailForm } from '../tax/AnnualReportDetailForm'
import { ScheduleChecklist } from '../annex/ScheduleChecklist'
import { AnnualPLSummary } from '../financials/AnnualPLSummary'
import { ReportHistoryTable } from './ReportHistoryTable'
import { StatusHistoryTimeline } from '../statusTransition/StatusHistoryTimeline'
import { annualReportsApi, annualReportsQK } from '../../api'
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
  onSelectReport?: (reportId: number) => void
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
  onSelectReport,
  onDirtyChange,
  submitRef,
}) => {
  const [plExpanded, setPlExpanded] = useState(false)

  const { data: history } = useQuery({
    queryKey: annualReportsQK.statusHistory(report.id),
    queryFn: () => annualReportsApi.getHistory(report.id),
    enabled: !!report.id,
  })

  return (
    <div className="space-y-6">
      <ReportAlertBanners report={report} advances={advances} />

      <ReportSummaryCards reportId={report.id} />

      {/* Meta + detail form */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">פרטי הדוח</h3>
          <ReportMetaGrid report={report} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">עדכון נתונים</h3>
          <AnnualReportDetailForm
            detail={detail}
            onSave={onDetailSave}
            isSaving={isSaving}
            onDirtyChange={onDirtyChange}
            submitRef={submitRef}
          />
        </div>
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

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">היסטוריית דוחות</h3>
        <ReportHistoryTable clientId={clientId} currentReportId={report.id} onSelect={onSelectReport} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">היסטוריית סטטוסים</h3>
        <StatusHistoryTimeline history={history?.items ?? []} />
      </div>

      <EntityAuditTrailSection
        entityType="annual_report"
        entityId={report.id}
        title="יומן שינויים"
        subtitle="שינויים שבוצעו בדוח השנתי"
      />
    </div>
  )
}

AnnualReportOverviewSection.displayName = 'AnnualReportOverviewSection'
