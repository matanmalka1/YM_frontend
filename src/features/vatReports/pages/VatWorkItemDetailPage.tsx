import { useParams, Navigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/overlays/Alert'
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/primitives/SegmentedControl'
import { TableSkeleton } from '@/components/ui/table'
import { VatInvoiceTab } from '../components/detail/VatInvoiceTab'
import { VatSummaryTab } from '../components/detail/VatSummaryTab'
import { VatWorkItemHeaderActions } from '../components/detail/VatWorkItemHeaderActions'
import { VatHistoryTab } from '../components/detail/VatHistoryTab'
import { VatWorkItemSummaryBar } from '../components/list/VatWorkItemSummaryBar'
import { VatFiledBanner } from '../components/shared/VatFiledBanner'
import { useVatWorkItemDetailPage } from '../hooks/useVatWorkItemDetailPage'
import { VAT_MESSAGES } from '../messages'

const VatDetailContent: React.FC<{ workItemId: number }> = ({ workItemId }) => {
  const { status, workItem, invoices, headerProps, filedBanner, tabs, activeTab, setTab, filing } =
    useVatWorkItemDetailPage(workItemId)

  if (status.isLoading) {
    return (
      <div className="space-y-4">
        <TableSkeleton rows={1} columns={3} />
        <TableSkeleton rows={5} columns={5} />
      </div>
    )
  }
  if (status.error || !workItem || !headerProps) return <Alert variant="error" message={status.error ?? ''} />

  return (
    <div className="space-y-4">
      <PageHeader {...headerProps} actions={<VatWorkItemHeaderActions workItem={workItem} />} />
      <VatWorkItemSummaryBar workItem={workItem} onFilingPendingChange={filing.setPending} />

      {filedBanner && <VatFiledBanner {...filedBanner} />}

      <SegmentedControl variant="tabBar" aria-label={VAT_MESSAGES.detail.tabsAriaLabel}>
        {tabs.map(({ key, label, icon: Icon, badge }) => (
          <SegmentedControlItem
            key={key}
            variant="tabBar"
            selected={activeTab === key}
            onClick={() => setTab(key)}
            icon={<Icon className="h-4 w-4 shrink-0" />}
            badge={badge}
          >
            {label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>

      <div>
        {activeTab === 'summary' && <VatSummaryTab workItem={workItem} invoices={invoices} />}
        {activeTab === 'income' && (
          <VatInvoiceTab
            invoiceType="income"
            workItemId={workItem.id}
            workItem={workItem}
            invoices={invoices}
            isFilingPending={filing.isPending}
          />
        )}
        {activeTab === 'expense' && (
          <VatInvoiceTab
            invoiceType="expense"
            workItemId={workItem.id}
            workItem={workItem}
            invoices={invoices}
            isFilingPending={filing.isPending}
          />
        )}
        {activeTab === 'history' && <VatHistoryTab workItemId={workItem.id} />}
      </div>
    </div>
  )
}

export const VatWorkItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const numId = Number(id)
  if (!id || isNaN(numId) || numId <= 0) return <Navigate to="/tax/vat" replace />
  return <VatDetailContent workItemId={numId} />
}
