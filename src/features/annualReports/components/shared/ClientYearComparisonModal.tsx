import { Modal } from '../../../../components/ui/overlays/Modal'
import { DataTable, type Column } from '../../../../components/ui/table/DataTable'
import { getStatusLabel } from '../../api/utils'
import type { AnnualReportListItem } from '../../api/contracts'
import { formatShekelAmount } from '@/utils/utils'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

interface Props {
  open: boolean
  onClose: () => void
  reports: AnnualReportListItem[]
}

interface MetricRow {
  label: string
  render: (r: AnnualReportListItem) => string
}

// Pivot: rows are metrics, columns are years. DataTable iterates these as its
// `data`; the year columns are computed per-report below.
const ROWS: MetricRow[] = [
  { label: ANNUAL_REPORTS_MESSAGES.yearComparisonModal.statusLabel, render: (r) => getStatusLabel(r.status) },
  { label: ANNUAL_REPORTS_MESSAGES.yearComparisonModal.taxDueLabel, render: (r) => formatShekelAmount(r.tax_due) },
  {
    label: ANNUAL_REPORTS_MESSAGES.yearComparisonModal.refundDueLabel,
    render: (r) => formatShekelAmount(r.refund_due),
  },
  {
    label: ANNUAL_REPORTS_MESSAGES.yearComparisonModal.assessmentAmountLabel,
    render: (r) => formatShekelAmount(r.assessment_amount),
  },
]

export const ClientYearComparisonModal: React.FC<Props> = ({ open, onClose, reports }) => {
  const sorted = reports.toSorted((a, b) => b.tax_year - a.tax_year)

  const columns: Column<MetricRow>[] = [
    {
      key: 'label',
      header: '',
      render: (m) => m.label,
      className: 'font-semibold text-gray-900',
      headerClassName: 'w-32',
    },
    ...sorted.map(
      (r): Column<MetricRow> => ({
        key: `year-${r.id}`,
        header: String(r.tax_year),
        render: (m) => m.render(r),
      }),
    ),
  ]

  return (
    <Modal open={open} onClose={onClose} title={ANNUAL_REPORTS_MESSAGES.yearComparisonModal.title}>
      {sorted.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">{ANNUAL_REPORTS_MESSAGES.yearComparisonModal.empty}</p>
      ) : (
        <DataTable data={ROWS} columns={columns} getRowKey={(m) => m.label} surface="embedded" />
      )}
    </Modal>
  )
}

ClientYearComparisonModal.displayName = 'ClientYearComparisonModal'
