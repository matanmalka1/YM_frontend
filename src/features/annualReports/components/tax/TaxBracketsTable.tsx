import type { BracketBreakdownItem } from '../../api'
import { DataTable, type Column } from '@/components/ui/table/DataTable'
import { formatCurrencyILS as fmt } from '@/utils/utils'
import { fmtRange, fmtRate } from '../../utils/taxHelpers'

interface Props {
  brackets: BracketBreakdownItem[]
}

export const TaxBracketsTable: React.FC<Props> = ({ brackets }) => {
  if (brackets.length === 0) return null

  const lastIndex = brackets.length - 1

  const columns: Column<BracketBreakdownItem>[] = [
    { key: 'rate', header: 'מדרגה', align: 'right', render: (b) => fmtRate(b.rate), className: 'text-gray-900' },
    {
      key: 'range',
      header: 'טווח הכנסה',
      align: 'right',
      dir: 'ltr',
      render: (b) => fmtRange(b.from_amount, b.to_amount),
      className: 'tabular-nums text-gray-600',
    },
    {
      key: 'taxable',
      header: 'הכנסה במדרגה',
      align: 'right',
      dir: 'ltr',
      render: (b) => fmt(b.taxable_in_bracket),
      className: 'tabular-nums text-gray-900',
    },
    {
      key: 'tax',
      header: 'מס במדרגה',
      align: 'right',
      dir: 'ltr',
      render: (b) => fmt(b.tax_in_bracket),
      className: 'tabular-nums text-gray-900',
    },
  ]

  return (
    <div className="mt-3">
      <p className="mb-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">פירוט מדרגות מס</p>
      <DataTable
        data={brackets}
        columns={columns}
        getRowKey={(b) => b.rate}
        rowClassName={(_, i) => (i === lastIndex ? 'bg-warning-50 font-semibold' : '')}
        surface="embedded"
      />
    </div>
  )
}
