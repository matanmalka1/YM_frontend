import { EntityAuditTrailSection, type FieldValueLabels } from '@/features/audit'
import { STATUS_LABELS, SCHEDULE_LABELS } from '../../constants/display'
import { CLIENT_TYPE_LABELS } from '../../constants/display'
import { ANNEX_FIELD_LABELS } from '../../constants/annexConstants'
import type { AnnualReportFull } from '../../api'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

const AUDIT_FIELD_VALUE_LABELS: FieldValueLabels = {
  client_type: CLIENT_TYPE_LABELS,
  status: STATUS_LABELS,
  schedule: SCHEDULE_LABELS,
}

interface AnnualReportTimelineTabProps {
  report: AnnualReportFull
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
        nestedFieldLabels={ANNEX_FIELD_LABELS}
      />
    </div>
  )
}

AnnualReportTimelineTab.displayName = 'AnnualReportTimelineTab'
