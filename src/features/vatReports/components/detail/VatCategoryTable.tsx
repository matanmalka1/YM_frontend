import { cn } from '@/utils/utils'
import { Alert } from '@/components/ui/overlays/Alert'
import { DataTable, type Column } from '@/components/ui/table/DataTable'
import { formatVatAmount, getVatDeductionRateClass, getVatDeductionRateLabel } from '../../utils/vatHelpers'
import type { VatCategoryTableProps } from '../../types'
import type { ExpenseCategoryRow } from '../../utils/vatBreakdown'
import { VAT_DEDUCTIBLE_ACCENT } from '../../constants/visualizationTokens'

export const VatCategoryTable: React.FC<VatCategoryTableProps> = ({
  rows,
  totalExpenseNet,
  totalGrossVat,
  totalInputVat,
}) => {
  if (!rows?.length) return null

  const totalGrossAmount = totalExpenseNet + totalGrossVat
  const showNonDeductibleNote = totalExpenseNet > 0 && totalInputVat === 0

  const columns: Column<ExpenseCategoryRow>[] = [
    {
      key: 'category',
      header: 'קטגוריה',
      align: 'right',
      render: (row) => <span className="font-medium text-gray-900">{row.label}</span>,
      footer: 'סה"כ',
    },
    {
      key: 'rate',
      header: '% ניכוי',
      align: 'right',
      className: 'font-mono tabular-nums',
      render: (row) => (
        <span className={getVatDeductionRateClass(row.deductionRate)}>
          {getVatDeductionRateLabel(row.deductionRate)}
        </span>
      ),
      footer: null,
    },
    {
      key: 'gross',
      header: 'הוצאה ברוטו',
      align: 'right',
      className: 'font-mono tabular-nums',
      render: (row) => <span className="text-gray-600">{formatVatAmount(row.netAmount + row.grossVat)}</span>,
      footer: formatVatAmount(totalGrossAmount),
    },
    {
      key: 'invoiceVat',
      header: 'מע"מ בחשבוניות',
      align: 'right',
      className: 'font-mono tabular-nums',
      render: (row) => <span className="text-gray-600">{formatVatAmount(row.grossVat)}</span>,
      footer: formatVatAmount(totalGrossVat),
    },
    {
      key: 'deductible',
      header: 'מע"מ לניכוי',
      align: 'right',
      className: 'font-mono tabular-nums',
      render: (row) => (
        <span className={cn('font-bold', VAT_DEDUCTIBLE_ACCENT)}>{formatVatAmount(row.deductibleVat)}</span>
      ),
      footer: (
        <span className={cn('underline decoration-2 underline-offset-4', VAT_DEDUCTIBLE_ACCENT)}>
          {formatVatAmount(totalInputVat)}
        </span>
      ),
    },
  ]

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">פירוט לפי קטגוריה</h3>
      {showNonDeductibleNote && (
        <Alert variant="neutral" size="sm" message='קטגוריות אלו אינן מזכות בניכוי מע"מ לפי הנתונים שהוזנו.' />
      )}

      <DataTable
        data={rows}
        columns={columns}
        getRowKey={(row) => row.categoryKey}
        footerClassName="border-t-2 border-gray-300 bg-gray-100/80 font-bold text-gray-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
      />
    </section>
  )
}

VatCategoryTable.displayName = 'VatCategoryTable'
