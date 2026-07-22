import { useState } from 'react'
import { Card } from '@/components/ui/primitives/Card'
import { Badge } from '@/components/ui/primitives/Badge'
import { Select } from '@/components/ui/inputs/Select'
import { canAddOrEditVatInvoices, canDeleteVatInvoices } from '../../utils/vatHelpers'
import { isClientClosed } from '@/features/clients/public'
import { useRole } from '@/hooks/useRole'
import { useAddInvoice } from '../../hooks/useVatInvoiceMutations'
import { useVatLifecyclePending } from '../../hooks/useVatLifecyclePending'
import { ALL_CATEGORIES_OPTION } from '@/constants/filterOptions.constants'
import { VatInvoiceTable } from '../list/VatInvoiceTable'
import { VatInvoiceAddForm } from '../form/VatInvoiceAddForm'
import type { VatInvoiceTabProps } from '../../types'
import { VAT_MESSAGES } from '../../messages'
import { useVatDeductionMetadata } from '../../hooks/useVatDeductionMetadata'

export const VatInvoiceTab: React.FC<VatInvoiceTabProps> = ({ invoiceType, workItemId, workItem, invoices }) => {
  const isLifecyclePending = useVatLifecyclePending(workItemId)
  const { can } = useRole()
  const canEdit =
    can.addOrEditVatInvoices &&
    canAddOrEditVatInvoices(workItem.available_actions) &&
    !isClientClosed(workItem.client_status) &&
    !isLifecyclePending
  const canDelete =
    canDeleteVatInvoices(workItem.available_actions, can.deleteVatInvoices) &&
    !isClientClosed(workItem.client_status) &&
    !isLifecyclePending
  const { addInvoice, isAdding } = useAddInvoice(workItemId)
  const [categoryFilter, setCategoryFilter] = useState('')
  const { categoryOptions } = useVatDeductionMetadata()

  const isExpense = invoiceType === 'expense'
  const byType = invoices.filter((i) => i.invoice_type === invoiceType)
  const filtered = byType.filter((i) => !isExpense || !categoryFilter || i.expense_category === categoryFilter)

  const title = isExpense ? VAT_MESSAGES.invoiceTab.expenseTitle : VAT_MESSAGES.invoiceTab.incomeTitle
  const borderColor = isExpense ? 'border-r-warning-400' : 'border-r-positive-400'
  const noResultsForFilter = byType.length > 0 && filtered.length === 0
  const emptyMessage = noResultsForFilter
    ? VAT_MESSAGES.invoiceTab.noCategoryInvoices
    : isExpense
      ? VAT_MESSAGES.invoiceTab.noExpenseInvoices
      : VAT_MESSAGES.invoiceTab.noIncomeInvoices

  return (
    <div>
      <Card
        title={title}
        className={`border-r-2 ${borderColor}`}
        actions={<Badge variant="neutral">{VAT_MESSAGES.invoiceTab.records(filtered.length)}</Badge>}
      >
        {isExpense && (
          <Select
            fieldClassName="mb-3 w-52"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[ALL_CATEGORIES_OPTION, ...categoryOptions]}
          />
        )}
        <VatInvoiceTable
          invoices={filtered}
          canEdit={canEdit}
          canDelete={canDelete}
          workItemId={workItemId}
          sectionType={invoiceType}
          emptyMessage={emptyMessage}
          emptyHint={noResultsForFilter ? undefined : VAT_MESSAGES.invoiceTab.addInvoiceHint}
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
