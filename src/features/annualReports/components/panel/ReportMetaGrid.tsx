import type { AnnualReportFull } from '../../api'
import { DefinitionList } from '../../../../components/ui/layout/DefinitionList'
import { getClientTypeLabel } from '../../utils/panelHelpers'
import { formatDate } from '@/utils/utils'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

interface ReportMetaGridProps {
  report: AnnualReportFull
}

export const ReportMetaGrid = ({ report }: ReportMetaGridProps) => (
  <DefinitionList
    columns={2}
    items={[
      { label: ANNUAL_REPORTS_MESSAGES.reportMetaGrid.taxYear, value: report.tax_year },
      { label: ANNUAL_REPORTS_MESSAGES.reportMetaGrid.clientType, value: getClientTypeLabel(report) },
      { label: ANNUAL_REPORTS_MESSAGES.reportMetaGrid.formTypeHeader, value: report.form_type ? ANNUAL_REPORTS_MESSAGES.reportMetaGrid.formTypeValue(report.form_type) : '—' },
      { label: ANNUAL_REPORTS_MESSAGES.reportMetaGrid.itaReference, value: report.ita_reference },
      { label: ANNUAL_REPORTS_MESSAGES.reportMetaGrid.submittedAt, value: formatDate(report.submitted_at) },
      { label: ANNUAL_REPORTS_MESSAGES.reportMetaGrid.filingDeadline, value: formatDate(report.filing_deadline) },
    ]}
  />
)

ReportMetaGrid.displayName = 'ReportMetaGrid'
