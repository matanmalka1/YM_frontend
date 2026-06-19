import { cn } from '@/utils/utils'
import { formatVatAmount, getVatDeductionRateClass, getVatDeductionRateLabel } from '../../utils/vatHelpers'
import type { VatCategoryTableProps } from '../../types'
import { VAT_DEDUCTIBLE_ACCENT } from '../../constants/visualizationTokens'

const TABLE_COLUMNS = ['קטגוריה', '% ניכוי', 'הוצאה ברוטו', 'מע"מ בחשבוניות', 'מע"מ לניכוי']

const headerCellClass = 'px-4 py-3 text-right'
const amountCellClass = 'px-4 py-3 text-right font-mono tabular-nums'
const mutedAmountCellClass = `${amountCellClass} text-gray-600`

export const VatCategoryTable: React.FC<VatCategoryTableProps> = ({
  rows,
  totalExpenseNet,
  totalGrossVat,
  totalInputVat,
}) => {
  if (!rows?.length) return null

  const totalGrossAmount = totalExpenseNet + totalGrossVat
  const showNonDeductibleNote = totalExpenseNet > 0 && totalInputVat === 0

  return (
    <section dir="rtl" className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">פירוט לפי קטגוריה</h3>
        {showNonDeductibleNote && (
          <p className="text-xs text-gray-500">קטגוריות אלו אינן מזכות בניכוי מע&quot;מ לפי הנתונים שהוזנו.</p>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50/80 text-xs font-semibold text-gray-500 backdrop-blur-sm">
            <tr>
              {TABLE_COLUMNS.map((column) => (
                <th key={column} scope="col" className={headerCellClass}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.map((row) => {
              const grossAmount = row.netAmount + row.grossVat

              return (
                <tr key={row.categoryKey} className="group transition-colors hover:bg-primary-50/30">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.label}</td>
                  <td className={cn(amountCellClass, getVatDeductionRateClass(row.deductionRate))}>
                    {getVatDeductionRateLabel(row.deductionRate)}
                  </td>
                  <td className={mutedAmountCellClass}>{formatVatAmount(grossAmount)}</td>
                  <td className={mutedAmountCellClass}>{formatVatAmount(row.grossVat)}</td>
                  <td className={cn('px-4 py-3 text-right font-mono font-bold tabular-nums', VAT_DEDUCTIBLE_ACCENT)}>
                    {formatVatAmount(row.deductibleVat)}
                  </td>
                </tr>
              )
            })}
          </tbody>

          <tfoot className="border-t-2 border-gray-300 bg-gray-100/80 text-gray-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <tr className="font-bold">
              <td className="px-4 py-3">סה"כ</td>
              <td />
              <td className={amountCellClass}>{formatVatAmount(totalGrossAmount)}</td>
              <td className={amountCellClass}>{formatVatAmount(totalGrossVat)}</td>
              <td className={cn(`${amountCellClass} underline decoration-2 underline-offset-4`, VAT_DEDUCTIBLE_ACCENT)}>
                {formatVatAmount(totalInputVat)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}

VatCategoryTable.displayName = 'VatCategoryTable'
