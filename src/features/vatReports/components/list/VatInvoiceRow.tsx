import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/primitives/Badge'
import { RowActionItem, RowActionSeparator, RowActionsMenu } from '@/components/ui/table'
import {
  formatVatAmount,
  getVatDeductionRateClass,
  getVatDeductionRateLabel,
  getVatInvoiceActionLabel,
  getVatInvoiceDisplayNumber,
} from '../../utils/vatHelpers'
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  DOCUMENT_TYPE_LABELS,
  VAT_EXCEPTIONAL_INVOICE_TOOLTIP,
  VAT_RATE_TYPE_LABELS,
  type VatDocumentTypeValue,
  type VatRateTypeValue,
} from '../../constants'
import { formatDate, formatDateTime } from '@/utils/utils'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import type { VatInvoiceRowProps } from '../../types'

const TD = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <td className={`px-4 py-2.5 ${className}`}>{children}</td>
)

export const VatInvoiceRow: React.FC<VatInvoiceRowProps> = ({
  inv,
  sectionType,
  accentBorder,
  canEdit,
  editingAny,
  onEdit,
  onDelete,
}) => {
  const isExpense = sectionType === 'expense'
  const catColor = inv.expense_category ? CATEGORY_COLORS[inv.expense_category] : ''
  const invoiceDisplayNumber = getVatInvoiceDisplayNumber(inv)
  const invoiceActionLabel = getVatInvoiceActionLabel(inv)

  return (
    <tr className="group transition-colors hover:bg-gray-50/60">
      <td className={`border-r-2 ${accentBorder} px-4 py-2.5 font-mono text-xs text-gray-500`}>
        {invoiceDisplayNumber}
        {inv.is_exceptional && (
          <span
            title={VAT_EXCEPTIONAL_INVOICE_TOOLTIP}
            className="mr-1.5 rounded bg-warning-100 px-1 py-0.5 text-xs font-medium text-warning-700"
          >
            חריגה
          </span>
        )}
      </td>
      <TD className="text-gray-500">{formatDate(inv.invoice_date)}</TD>
      <TD className="font-medium text-gray-700">{inv.counterparty_name}</TD>
      <TD className="whitespace-nowrap text-xs text-gray-500">
        {inv.counterparty_id ? <span className="font-mono">{inv.counterparty_id}</span> : '—'}
      </TD>
      <TD>
        {inv.document_type ? (
          <Badge variant="neutral">
            {DOCUMENT_TYPE_LABELS[inv.document_type as VatDocumentTypeValue] ?? inv.document_type}
          </Badge>
        ) : (
          '—'
        )}
      </TD>
      <TD>
        {inv.rate_type && inv.rate_type !== 'standard' ? (
          <Badge variant="info">{VAT_RATE_TYPE_LABELS[inv.rate_type as VatRateTypeValue] ?? inv.rate_type}</Badge>
        ) : (
          '—'
        )}
      </TD>
      {isExpense && (
        <TD>
          <span className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${catColor || 'bg-gray-300'}`} />
            <span className="text-xs text-gray-600">
              {inv.expense_category ? (CATEGORY_LABELS[inv.expense_category] ?? inv.expense_category) : '—'}
            </span>
          </span>
        </TD>
      )}
      <TD className="whitespace-nowrap">
        <span className={getVatDeductionRateClass(inv.deduction_rate)}>
          {getVatDeductionRateLabel(inv.deduction_rate)}
        </span>
      </TD>
      <TD className="font-medium font-mono tabular-nums">{formatVatAmount(inv.net_amount)}</TD>
      <TD className="font-mono tabular-nums text-gray-500">{formatVatAmount(inv.vat_amount)}</TD>
      {isExpense && (
        <TD className={`font-mono tabular-nums font-semibold ${semanticMonoToneClasses.positive}`}>
          {formatVatAmount(Number(inv.vat_amount) * Number(inv.deduction_rate))}
        </TD>
      )}
      <TD className="font-mono text-xs text-gray-400">#{inv.created_by}</TD>
      <TD className="whitespace-nowrap text-xs tabular-nums text-gray-400">{formatDateTime(inv.created_at)}</TD>
      {canEdit && (
        <td className="px-2 py-2">
          <RowActionsMenu ariaLabel={`פעולות עבור ${invoiceActionLabel}`}>
            <RowActionItem label="עריכה" onClick={onEdit} disabled={editingAny} icon={<Pencil className="h-4 w-4" />} />
            <RowActionSeparator />
            <RowActionItem
              label="מחק"
              onClick={onDelete}
              disabled={editingAny}
              icon={<Trash2 className="h-4 w-4" />}
              danger
            />
          </RowActionsMenu>
        </td>
      )}
    </tr>
  )
}

VatInvoiceRow.displayName = 'VatInvoiceRow'
