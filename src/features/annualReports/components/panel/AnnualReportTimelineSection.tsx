import { useQuery } from '@tanstack/react-query'
import { EntityAuditTrailSection } from '@/features/audit'
import { FilingTimelineTab } from '../shared/FilingTimelineTab'
import { StatusHistoryTimeline } from '../statusTransition/StatusHistoryTimeline'
import { annualReportsApi, annualReportsQK } from '../../api'
import { ReportHistoryTable } from './ReportHistoryTable'
import type { AnnualReportDetail } from '../../types'

interface AnnualReportTimelineSectionProps {
  report: AnnualReportDetail
}

export const AnnualReportTimelineSection = ({ report }: AnnualReportTimelineSectionProps) => {
  const { data: history } = useQuery({
    queryKey: annualReportsQK.statusHistory(report.id),
    queryFn: () => annualReportsApi.getHistory(report.id),
    enabled: !!report.id,
  })

  return (
    <div className="space-y-6">
      <FilingTimelineTab reports={[report]} />

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">היסטוריית דוחות</h3>
        <ReportHistoryTable clientId={report.client_record_id} currentReportId={report.id} />
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

AnnualReportTimelineSection.displayName = 'AnnualReportTimelineSection'
