import { EntityAuditTrailSection, type FieldValueLabels } from '@/features/audit'
import { FilingTimelineTab } from '../shared/FilingTimelineTab'
import { STATUS_LABELS } from '../../api'
import { CLIENT_TYPE_LABELS } from '../../constants/panelConstants'
import { Card } from '../../../../components/ui/primitives/Card'
import { ReportHistoryTable } from './ReportHistoryTable'
import type { AnnualReportDetail } from '../../types'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

const AUDIT_FIELD_VALUE_LABELS: FieldValueLabels = {
  client_type: CLIENT_TYPE_LABELS,
  status: STATUS_LABELS,
}

interface AnnualReportTimelineSectionProps {
  report: AnnualReportDetail
}

export const AnnualReportTimelineSection = ({ report }: AnnualReportTimelineSectionProps) => {
  return (
    <div className="space-y-6">
      <FilingTimelineTab reports={[report]} />

      <Card title={ANNUAL_REPORTS_MESSAGES.timelineSection.reportHistoryTitle} size="compact">
        <ReportHistoryTable clientId={report.client_record_id} currentReportId={report.id} />
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
