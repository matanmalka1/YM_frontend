import { useState } from 'react'
import { Card } from '../../../components/ui/primitives/Card'
import { Badge } from '../../../components/ui/primitives/Badge'
import { Select } from '../../../components/ui/inputs/Select'
import { canAddInvoice } from '../utils'
import { isClientClosed } from '../../../utils/clientStatus'
import { useAddInvoice } from '../hooks/useVatInvoiceMutations'
import { VAT_EXPENSE_CATEGORY_FILTER_OPTIONS } from '../constants'
import { VatInvoiceTable } from './VatInvoiceTable'
import { VatInvoiceAddForm } from './VatInvoiceAddForm'
import type { VatInvoiceTabProps } from '../types'

export const VatInvoiceTab: React.FC<VatInvoiceTabProps> = ({
  invoiceType,
  workItemId,
  workItem,
  invoices,
  isFilingPending,
}) => {
  const canEdit =
    canAddInvoice(workItem.available_actions) && !isClientClosed(workItem.client_status) && !isFilingPending
  const { addInvoice, isAdding } = useAddInvoice(workItemId)
  const [categoryFilter, setCategoryFilter] = useState('')

  const isExpense = invoiceType === 'expense'
  const filtered = invoices
    .filter((i) => i.invoice_type === invoiceType)
    .filter((i) => !isExpense || !categoryFilter || i.expense_category === categoryFilter)

  const title = isExpense ? 'תשומות (מע"מ תשומות)' : 'עסקאות (מע"מ עסקאות)'
  const borderColor = isExpense ? 'border-r-orange-400' : 'border-r-emerald-400'
  const emptyMessage = isExpense ? 'עדיין לא הוספו חשבוניות תשומות' : 'עדיין לא הוספו חשבוניות עסקאות'

  return (
    <div dir="rtl">
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
