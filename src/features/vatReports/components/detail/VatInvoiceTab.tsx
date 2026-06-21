import { useState } from 'react'
import { Card } from '@/components/ui/primitives/Card'
import { Badge } from '@/components/ui/primitives/Badge'
import { Select } from '@/components/ui/inputs/Select'
import { canMutateVatInvoices } from '../../utils/vatHelpers'
import { isClientClosed } from '@/utils/clientStatus'
import { useAddInvoice } from '../../hooks/useVatInvoiceMutations'
import { VAT_EXPENSE_CATEGORY_FILTER_OPTIONS } from '../../constants/vatConstants'
import { VatInvoiceTable } from '../list/VatInvoiceTable'
import { VatInvoiceAddForm } from '../form/VatInvoiceAddForm'
import type { VatInvoiceTabProps } from '../../types'

export const VatInvoiceTab: React.FC<VatInvoiceTabProps> = ({
  invoiceType,
  workItemId,
  workItem,
  invoices,
  isFilingPending,
}) => {
  const canEdit =
    canMutateVatInvoices(workItem.available_actions) && !isClientClosed(workItem.client_status) && !isFilingPending
  const { addInvoice, isAdding } = useAddInvoice(workItemId)
  const [categoryFilter, setCategoryFilter] = useState('')

  const isExpense = invoiceType === 'expense'
  const byType = invoices.filter((i) => i.invoice_type === invoiceType)
  const filtered = byType.filter((i) => !isExpense || !categoryFilter || i.expense_category === categoryFilter)

  const title = isExpense ? 'תשומות (מע"מ תשומות)' : 'עסקאות (מע"מ עסקאות)'
  const borderColor = isExpense ? 'border-r-warning-400' : 'border-r-positive-400'
  const noResultsForFilter = byType.length > 0 && filtered.length === 0
  const emptyMessage = noResultsForFilter
    ? 'אין חשבוניות בקטגוריה זו'
    : isExpense
      ? 'עדיין לא הוספו חשבוניות תשומות'
      : 'עדיין לא הוספו חשבוניות עסקאות'

  return (
    <div>
      <Card
        title={title}
        className={`border-r-2 ${borderColor}`}
        actions={<Badge variant="neutral">{filtered.length} רשומות</Badge>}
      >
        {isExpense && (
          <Select
            fieldClassName="mb-3 w-52"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={VAT_EXPENSE_CATEGORY_FILTER_OPTIONS}
          />
        )}
        <VatInvoiceTable
          invoices={filtered}
          canEdit={canEdit}
          workItemId={workItemId}
          sectionType={invoiceType}
          emptyMessage={emptyMessage}
          emptyHint={noResultsForFilter ? undefined : "לחץ על 'הוסף חשבונית' כדי להוסיף"}
        />
        {canEdit && (
          <div className="mt-3">
            <VatInvoiceAddForm invoiceType={invoiceType} addInvoice={addInvoice} isAdding={isAdding} />
          </div>
        )}
      </Card>
    </div>
  )
}

VatInvoiceTab.displayName = 'VatInvoiceTab'
