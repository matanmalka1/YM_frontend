import type { BracketBreakdownItem } from '../../api'
import { DataTable, moneyColumn, numberColumn, type Column } from '@/components/ui/table'
import { formatCurrencyILS } from '@/utils/utils'
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
      kind: 'number',
      render: (b) => fmtRate(b.rate),
    },
    numberColumn({
      key: 'range',
      header: ANNUAL_REPORTS_MESSAGES.bracketsTable.rangeHeader,
      getValue: (b) => fmtRange(b.from_amount, b.to_amount),
    }),
    moneyColumn({
      key: 'taxable',
      header: ANNUAL_REPORTS_MESSAGES.bracketsTable.taxableInBracketHeader,
      getValue: (b) => formatCurrencyILS(b.taxable_in_bracket),
    }),
    moneyColumn({
      key: 'tax',
      header: ANNUAL_REPORTS_MESSAGES.bracketsTable.taxInBracketHeader,
      getValue: (b) => formatCurrencyILS(b.tax_in_bracket),
    }),
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
        getRowVariant={(_, i) => (i === lastIndex ? 'warningSoft' : undefined)}
        surface="embedded"
      />
    </div>
  )
}
