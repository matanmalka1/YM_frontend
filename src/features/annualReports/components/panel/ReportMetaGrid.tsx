import type { AnnualReportFull } from '../../api'
import { DefinitionList } from '../../../../components/ui/layout/DefinitionList'
import { formatPanelDate, getClientTypeLabel } from './helpers'
import { formatAnnualReportDate } from '../shared/annualReports.constants'

interface ReportMetaGridProps {
  report: AnnualReportFull
}

export const ReportMetaGrid = ({ report }: ReportMetaGridProps) => (
  <DefinitionList
    columns={2}
    items={[
      { label: 'שנת מס', value: report.tax_year },
      { label: 'סוג לקוח', value: getClientTypeLabel(report) },
      { label: 'טופס', value: report.form_type ? `טופס ${report.form_type}` : '—' },
      { label: 'מספר אסמכתא', value: report.ita_reference },
      { label: 'הוגש בתאריך', value: formatPanelDate(report.submitted_at) },
      { label: 'מועד הגשה', value: formatAnnualReportDate(report.filing_deadline) },
    ]}
  />
)

ReportMetaGrid.displayName = 'ReportMetaGrid'
