import { Modal } from '../../../../components/ui/overlays/Modal'
import { getStatusLabel } from '../../api/utils'
import type { AnnualReportListItem } from '../../api/contracts'
import { formatShekelAmount } from '@/utils/utils'

interface Props {
  open: boolean
  onClose: () => void
  reports: AnnualReportListItem[]
}

const ROWS: { label: string; render: (r: AnnualReportListItem) => string }[] = [
  { label: 'סטטוס', render: (r) => getStatusLabel(r.status) },
  { label: 'חבות מס', render: (r) => formatShekelAmount(r.tax_due) },
  { label: 'החזר מס', render: (r) => formatShekelAmount(r.refund_due) },
  { label: 'סכום שומה', render: (r) => formatShekelAmount(r.assessment_amount) },
]

export const ClientYearComparisonModal: React.FC<Props> = ({ open, onClose, reports }) => {
  const sorted = reports.toSorted((a, b) => b.tax_year - a.tax_year)

  return (
    <Modal open={open} onClose={onClose} title="השוואה בין שנים" footer={null}>
      {sorted.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">אין דוחות להשוואה</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 pr-1 text-right font-medium text-gray-500 w-32"></th>
                {sorted.map((r) => (
                  <th key={r.id} className="py-2 px-3 text-center font-semibold text-gray-900">
                    {r.tax_year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(({ label, render }) => (
                <tr key={label} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 pr-1 font-medium text-gray-700">{label}</td>
                  {sorted.map((r) => (
                    <td key={r.id} className="py-2 px-3 text-center text-gray-800">
                      {render(r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  )
}

ClientYearComparisonModal.displayName = 'ClientYearComparisonModal'
