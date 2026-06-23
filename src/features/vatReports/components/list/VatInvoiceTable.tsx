import { useState } from 'react'
import { Pencil, Receipt, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { Badge } from '@/components/ui/primitives/Badge'
import { InlineState } from '@/components/ui/feedback'
import { DataTable, type Column } from '@/components/ui/table/DataTable'
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
} from '../../constants/vatConstants'
import { formatDate, formatDateTime } from '@/utils/utils'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import { useDeleteInvoice, useUpdateInvoice } from '../../hooks/useVatInvoiceMutations'
import { VatInvoiceEditRow } from './VatInvoiceEditRow'
import type { VatInvoiceTableProps } from '../../types'

type Invoice = VatInvoiceTableProps['invoices'][number]

export const VatInvoiceTable: React.FC<VatInvoiceTableProps> = ({
  invoices,
  canEdit,
  workItemId,
  sectionType,
  emptyMessage,
  emptyHint,
}) => {
  const { deleteInvoice, isDeleting } = useDeleteInvoice(workItemId)
  const { updateInvoice, isUpdating } = useUpdateInvoice(workItemId)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)

  const isExpense = sectionType === 'expense'
  const accentBorder = sectionType === 'income' ? 'border-positive-300' : 'border-warning-300'

  const totalNet = invoices.reduce((s, i) => s + Number(i.net_amount ?? 0), 0)
  const totalVat = invoices.reduce((s, i) => s + Number(i.vat_amount ?? 0), 0)
  const totalDeductibleVat = invoices.reduce((s, i) => s + Number(i.vat_amount ?? 0) * Number(i.deduction_rate ?? 0), 0)

  // base cols: מספר תאריך ספק ח.פ סוגמסמך סוגעסקה %הכרה נטו מעמ נוצרעי נוצרב = 11
  // expense adds: קטגוריה + מעמלניכוי = +2 · canEdit adds: actions = +1
  const totalCols = 11 + (isExpense ? 2 : 0) + (canEdit ? 1 : 0)

  if (invoices.length === 0) {
    return (
      <InlineState
        icon={Receipt}
        title={emptyMessage ?? 'אין חשבוניות עדיין'}
        description={emptyHint}
        className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50"
      />
    )
  }

  const columns: Column<Invoice>[] = [
    {
      key: 'number',
      header: 'מספר',
      align: 'right',
      className: `border-r-2 ${accentBorder} font-mono text-xs text-gray-500`,
      render: (inv) => (
        <>
          {getVatInvoiceDisplayNumber(inv)}
          {inv.is_exceptional && (
            <span
              title={VAT_EXCEPTIONAL_INVOICE_TOOLTIP}
              className="mr-1.5 rounded bg-warning-100 px-1 py-0.5 text-xs font-medium text-warning-700"
            >
              חריגה
            </span>
          )}
        </>
      ),
    },
    {
      key: 'date',
      header: 'תאריך',
      align: 'right',
      className: 'text-gray-500',
      render: (inv) => formatDate(inv.invoice_date),
    },
    {
      key: 'counterparty_name',
      header: 'ספק / לקוח',
      align: 'right',
      className: 'font-medium text-gray-700',
      render: (inv) => inv.counterparty_name,
    },
    {
      key: 'counterparty_id',
      header: 'ח.פ / ע.מ',
      align: 'right',
      className: 'whitespace-nowrap text-xs text-gray-500',
      render: (inv) => (inv.counterparty_id ? <span className="font-mono">{inv.counterparty_id}</span> : '—'),
    },
    {
      key: 'document_type',
      header: 'סוג מסמך',
      align: 'right',
      render: (inv) =>
        inv.document_type ? (
          <Badge variant="neutral">
            {DOCUMENT_TYPE_LABELS[inv.document_type as VatDocumentTypeValue] ?? inv.document_type}
          </Badge>
        ) : (
          '—'
        ),
    },
    {
      key: 'rate_type',
      header: 'סוג עסקה',
      align: 'right',
      render: (inv) =>
        inv.rate_type && inv.rate_type !== 'standard' ? (
          <Badge variant="info">{VAT_RATE_TYPE_LABELS[inv.rate_type as VatRateTypeValue] ?? inv.rate_type}</Badge>
        ) : (
          '—'
        ),
    },
    ...(isExpense
      ? ([
          {
            key: 'expense_category',
            header: 'קטגוריה',
            align: 'right',
            render: (inv) => (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${(inv.expense_category ? CATEGORY_COLORS[inv.expense_category] : '') || 'bg-gray-300'}`}
                />
                <span className="text-xs text-gray-600">
                  {inv.expense_category ? (CATEGORY_LABELS[inv.expense_category] ?? inv.expense_category) : '—'}
                </span>
              </span>
            ),
          },
        ] as Column<Invoice>[])
      : []),
    {
      key: 'deduction_rate',
      header: '% הכרה',
      align: 'right',
      className: 'whitespace-nowrap',
      render: (inv) => (
        <span className={getVatDeductionRateClass(inv.deduction_rate)}>
          {getVatDeductionRateLabel(inv.deduction_rate)}
        </span>
      ),
    },
    {
      key: 'net_amount',
      header: 'נטו ₪',
      align: 'right',
      className: 'font-medium font-mono tabular-nums',
      render: (inv) => formatVatAmount(inv.net_amount),
    },
    {
      key: 'vat_amount',
      header: 'מע"מ ₪',
      align: 'right',
      className: 'font-mono tabular-nums text-gray-500',
      render: (inv) => formatVatAmount(inv.vat_amount),
    },
    ...(isExpense
      ? ([
          {
            key: 'deductible_vat',
            header: 'מע"מ לניכוי',
            align: 'right',
            className: `font-mono tabular-nums font-semibold ${semanticMonoToneClasses.positive}`,
            render: (inv) => formatVatAmount(Number(inv.vat_amount) * Number(inv.deduction_rate)),
          },
        ] as Column<Invoice>[])
      : []),
    {
      key: 'created_by',
      header: 'נוצר ע"י',
      align: 'right',
      className: 'font-mono text-xs text-gray-400',
      render: (inv) => `#${inv.created_by}`,
    },
    {
      key: 'created_at',
      header: 'נוצר ב',
      align: 'right',
      className: 'whitespace-nowrap text-xs tabular-nums text-gray-400',
      render: (inv) => formatDateTime(inv.created_at),
    },
    ...(canEdit
      ? ([
          {
            key: '__actions',
            header: '',
            align: 'right',
            headerClassName: 'w-16',
            render: (inv) => (
              <RowActionsMenu ariaLabel={`פעולות עבור ${getVatInvoiceActionLabel(inv)}`}>
                <RowActionItem
                  label="עריכה"
                  onClick={() => setEditingId(inv.id)}
                  disabled={editingId !== null}
                  icon={<Pencil className="h-4 w-4" />}
                />
                <RowActionSeparator />
                <RowActionItem
                  label="מחק"
                  onClick={() => setConfirmId(inv.id)}
                  disabled={editingId !== null}
                  icon={<Trash2 className="h-4 w-4" />}
                  danger
                />
              </RowActionsMenu>
            ),
          },
        ] as Column<Invoice>[])
      : []),
  ]

  return (
    <>
      <DataTable
        data={invoices}
        columns={columns}
        getRowKey={(inv) => inv.id}
        editingRowKey={editingId}
        surface="embedded"
        footerClassName="border-t-2 border-gray-200 bg-gray-50"
        renderEditRow={(inv) => (
          <VatInvoiceEditRow
            invoice={inv}
            sectionType={sectionType}
            accentBorder={accentBorder}
            onSave={(payload) => updateInvoice(inv.id, payload)}
            onCancel={() => setEditingId(null)}
            isSaving={isUpdating}
          />
        )}
        renderFooter={() => (
          <tr>
            <td colSpan={totalCols - (canEdit ? 3 : 2)} className="px-4 py-2.5 text-right">
              <span className="inline-flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">סה&quot;כ</span>
                <Badge variant="neutral" size="xs" className="bg-gray-200 px-2 font-bold text-gray-600">
                  {invoices.length}
                </Badge>
              </span>
            </td>
            <td className="px-4 py-2.5 font-mono tabular-nums font-bold text-gray-800">{formatVatAmount(totalNet)}</td>
            <td className="px-4 py-2.5 font-mono tabular-nums font-semibold text-gray-600">
              {formatVatAmount(totalVat)}
            </td>
            {isExpense && (
              <td className={`px-4 py-2.5 font-mono tabular-nums font-bold ${semanticMonoToneClasses.positive}`}>
                {formatVatAmount(totalDeductibleVat)}
              </td>
            )}
            <td colSpan={canEdit ? 3 : 2} />
          </tr>
        )}
      />
      <ConfirmDialog
        open={confirmId !== null}
        title="מחיקת חשבונית"
        message="האם למחוק את החשבונית? פעולה זו אינה הפיכה."
        confirmLabel="מחק"
        cancelLabel="ביטול"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={async () => {
          if (confirmId !== null) {
            await deleteInvoice(confirmId)
            setConfirmId(null)
          }
        }}
        onCancel={() => setConfirmId(null)}
      />
    </>
  )
}

VatInvoiceTable.displayName = 'VatInvoiceTable'
