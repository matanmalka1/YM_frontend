import { useQuery } from '@tanstack/react-query'
import { EntityAuditTrailSection, type FieldValueLabels } from '@/features/audit'
import { FilingTimelineTab } from '../shared/FilingTimelineTab'
import { StatusAuditTimeline } from '../statusTransition/StatusAuditTimeline'
import { annualReportsApi, annualReportsQK } from '../../api'
import { CLIENT_TYPE_LABELS } from '../../constants/panelConstants'
import { Card } from '../../../../components/ui/primitives/Card'
import { ReportHistoryTable } from './ReportHistoryTable'
import type { AnnualReportDetail } from '../../types'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

const AUDIT_FIELD_VALUE_LABELS: FieldValueLabels = {
  client_type: CLIENT_TYPE_LABELS,
}

interface AnnualReportTimelineSectionProps {
  report: AnnualReportDetail
}

export const AnnualReportTimelineSection = ({ report }: AnnualReportTimelineSectionProps) => {
  const { data: audit } = useQuery({
    queryKey: annualReportsQK.audit(report.id),
    queryFn: () => annualReportsApi.getAudit(report.id),
    enabled: !!report.id,
  })

  return (
    <div className="space-y-6">
      <FilingTimelineTab reports={[report]} />

      <Card title={ANNUAL_REPORTS_MESSAGES.timelineSection.reportHistoryTitle} size="compact">
        <ReportHistoryTable clientId={report.client_record_id} currentReportId={report.id} />
      </Card>

      <Card title={ANNUAL_REPORTS_MESSAGES.timelineSection.statusHistoryTitle} size="compact">
        <StatusAuditTimeline audit={audit?.items ?? []} />
      </Card>

      <EntityAuditTrailSection
        entityType="annual_report"
        entityId={report.id}
        title={ANNUAL_REPORTS_MESSAGES.timelineSection.auditTitle}
        subtitle={ANNUAL_REPORTS_MESSAGES.timelineSection.auditSubtitle}
        fieldValueLabels={AUDIT_FIELD_VALUE_LABELS}
      />
    </div>
  )
}

AnnualReportTimelineSection.displayName = 'AnnualReportTimelineSection'
