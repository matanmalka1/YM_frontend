import { EntityAuditTrailSection, type FieldValueLabels } from '@/features/audit'
import { STATUS_LABELS } from '../../api'
import { CLIENT_TYPE_LABELS } from '../../constants/panelConstants'
import type { AnnualReportDetail } from '../../types'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

const AUDIT_FIELD_VALUE_LABELS: FieldValueLabels = {
  client_type: CLIENT_TYPE_LABELS,
  status: STATUS_LABELS,
}

interface AnnualReportTimelineTabProps {
  report: AnnualReportDetail
}

export const AnnualReportTimelineTab = ({ report }: AnnualReportTimelineTabProps) => {
  return (
    <div className="space-y-6">
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

AnnualReportTimelineTab.displayName = 'AnnualReportTimelineTab'
