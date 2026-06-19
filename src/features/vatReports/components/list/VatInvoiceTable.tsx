import { useState } from 'react'
import { Receipt } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { formatVatAmount } from '../../utils/vatHelpers'
import { useDeleteInvoice, useUpdateInvoice } from '../../hooks/useVatInvoiceMutations'
import { VatInvoiceEditRow } from './VatInvoiceEditRow'
import { VatInvoiceRow } from './VatInvoiceRow'
import type { VatInvoiceTableProps } from '../../types'
import { semanticMonoToneClasses } from '@/utils/semanticColors'

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
  // expense adds: קטגוריה + מעמלניכוי = +2
  // canEdit adds: actions = +1
  const totalCols = 11 + (isExpense ? 2 : 0) + (canEdit ? 1 : 0)

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 py-10 text-center">
        <Receipt className="h-8 w-8 text-gray-300" />
        <p className="text-sm font-medium text-gray-400">{emptyMessage ?? 'אין חשבוניות עדיין'}</p>
        {emptyHint && <p className="text-xs text-gray-300">{emptyHint}</p>}
      </div>
    )
  }

  const thCls = 'px-4 py-2.5 text-right'

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full border-collapse text-sm" dir="rtl">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className={thCls}>מספר</th>
              <th className={thCls}>תאריך</th>
              <th className={thCls}>ספק / לקוח</th>
              <th className={thCls}>ח.פ / ע.מ</th>
              <th className={thCls}>סוג מסמך</th>
              <th className={thCls}>סוג עסקה</th>
              {isExpense && <th className={thCls}>קטגוריה</th>}
              <th className={thCls}>% הכרה</th>
              <th className={thCls}>נטו ₪</th>
              <th className={thCls}>מע&quot;מ ₪</th>
              {isExpense && <th className={thCls}>מע&quot;מ לניכוי</th>}
              <th className={thCls}>נוצר ע&quot;י</th>
              <th className={thCls}>נוצר ב</th>
              {canEdit && <th className="w-16 px-2" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {invoices.map((inv) =>
              editingId === inv.id ? (
                <VatInvoiceEditRow
                  key={inv.id}
                  invoice={inv}
                  sectionType={sectionType}
                  accentBorder={accentBorder}
                  onSave={(payload) => updateInvoice(inv.id, payload)}
                  onCancel={() => setEditingId(null)}
                  isSaving={isUpdating}
                />
              ) : (
                <VatInvoiceRow
                  key={inv.id}
                  inv={inv}
                  sectionType={sectionType}
                  accentBorder={accentBorder}
                  canEdit={canEdit}
                  editingAny={editingId !== null}
                  onEdit={() => setEditingId(inv.id)}
                  onDelete={() => setConfirmId(inv.id)}
                />
              ),
            )}
          </tbody>
          <tfoot className="border-t-2 border-gray-200 bg-gray-50">
            <tr>
              <td colSpan={totalCols - (canEdit ? 3 : 2)} className="px-4 py-2.5 text-right">
                <span className="inline-flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">סה&quot;כ</span>
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-600">
                    {invoices.length}
                  </span>
                </span>
              </td>
              <td className="px-4 py-2.5 font-mono tabular-nums font-bold text-gray-800">
                {formatVatAmount(totalNet)}
              </td>
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
          </tfoot>
        </table>
      </div>
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
