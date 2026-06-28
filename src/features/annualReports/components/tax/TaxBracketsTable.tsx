import type { BracketBreakdownItem } from '../../api'
import { DataTable, type Column } from '@/components/ui/table/DataTable'
import { formatCurrencyILS as fmt } from '@/utils/utils'
import { fmtRange, fmtRate } from '../../utils/taxHelpers'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

interface Props {
  brackets: BracketBreakdownItem[]
}

export const TaxBracketsTable: React.FC<Props> = ({ brackets }) => {
  if (brackets.length === 0) return null

  const lastIndex = brackets.length - 1

  const columns: Column<BracketBreakdownItem>[] = [
    {
      key: 'rate',
      header: ANNUAL_REPORTS_MESSAGES.bracketsTable.rateHeader,
      render: (b) => fmtRate(b.rate),
      className: 'text-gray-700',
    },
    {
      key: 'range',
      header: ANNUAL_REPORTS_MESSAGES.bracketsTable.rangeHeader,
      dir: 'ltr',
      render: (b) => fmtRange(b.from_amount, b.to_amount),
      className: 'tabular-nums text-gray-700',
    },
    {
      key: 'taxable',
      header: ANNUAL_REPORTS_MESSAGES.bracketsTable.taxableInBracketHeader,
      dir: 'ltr',
      render: (b) => fmt(b.taxable_in_bracket),
      className: 'tabular-nums text-gray-700',
    },
    {
      key: 'tax',
      header: ANNUAL_REPORTS_MESSAGES.bracketsTable.taxInBracketHeader,
      dir: 'ltr',
      render: (b) => fmt(b.tax_in_bracket),
      className: 'tabular-nums text-gray-700',
    },
  ]

  return (
    <div className="mt-3">
      <p className="mb-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {ANNUAL_REPORTS_MESSAGES.bracketsTable.sectionTitle}
      </p>
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
