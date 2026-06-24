import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, ArrowUpCircle, Clock } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/overlays/Alert'
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/primitives/SegmentedControl'
import { TableSkeleton } from '@/components/ui/table/TableSkeleton'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { VatInvoiceTab } from '../components/detail/VatInvoiceTab'
import { VatSummaryTab } from '../components/detail/VatSummaryTab'
import { VatWorkItemHeaderActions } from '../components/detail/VatWorkItemHeaderActions'
import { VatHistoryTab } from '../components/detail/VatHistoryTab'
import { VatWorkItemSummaryBar } from '../components/list/VatWorkItemSummaryBar'
import { VatFiledBanner } from '../components/shared/VatFiledBanner'
import { useVatWorkItemPage } from '../hooks/useVatWorkItemPage'
import { isFiled } from '../utils/vatHelpers'
import { formatVatPeriodTitle, getVatClientTitle } from '../utils/viewHelpers'
import { VAT_MESSAGES } from '../messages'

type TabKey = 'summary' | 'income' | 'expense' | 'history'

const TAB_KEYS = ['summary', 'income', 'expense', 'history'] as const

const isTabKey = (tab: string | null): tab is TabKey => TAB_KEYS.some((tabKey) => tabKey === tab)

const VatDetailContent: React.FC<{ workItemId: number }> = ({ workItemId }) => {
  const { searchParams, setSearchParams } = useSearchParamFilters()
  const [isFilingPending, setIsFilingPending] = useState(false)
  const requestedTab = searchParams.get('tab')
  const activeTab = isTabKey(requestedTab) ? requestedTab : 'summary'
  const { workItem, invoices, isLoading, isError } = useVatWorkItemPage(workItemId)

  const setTab = (tab: TabKey) => setSearchParams(tab === 'summary' ? {} : { tab })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <TableSkeleton rows={1} columns={3} />
        <TableSkeleton rows={5} columns={5} />
      </div>
    )
  }
  if (isError || !workItem) return <Alert variant="error" message={VAT_MESSAGES.detail.loadingWorkItemError} />

  const incomeCount = invoices.filter((i) => i.invoice_type === 'income').length
  const expenseCount = invoices.filter((i) => i.invoice_type === 'expense').length

  const tabs: { key: TabKey; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: 'summary', label: VAT_MESSAGES.detail.tabSummary, icon: LayoutDashboard },
    { key: 'income', label: VAT_MESSAGES.detail.tabIncome, icon: ClipboardList, badge: incomeCount },
    { key: 'expense', label: VAT_MESSAGES.detail.tabExpense, icon: ArrowUpCircle, badge: expenseCount },
    { key: 'history', label: VAT_MESSAGES.detail.tabHistory, icon: Clock },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[
          { label: VAT_MESSAGES.detail.breadcrumbList, to: '/tax/vat' },
          { label: VAT_MESSAGES.detail.breadcrumbCurrent },
        ]}
        title={`${getVatClientTitle(workItem.client_name, workItem.client_record_id)} · ${formatVatPeriodTitle(workItem.period, workItem.period_type)}`}
        actions={<VatWorkItemHeaderActions workItem={workItem} />}
      />
      <VatWorkItemSummaryBar workItem={workItem} onFilingPendingChange={setIsFilingPending} />

      {isFiled(workItem.status) && workItem.filed_at && (
        <VatFiledBanner
          filedAt={workItem.filed_at}
          filedBy={workItem.filed_by}
          filedByName={workItem.filed_by_name}
          filingMethod={workItem.submission_method}
          submissionReference={workItem.submission_reference}
          isAmendment={workItem.is_amendment}
          amendsItemId={workItem.amends_item_id}
        />
      )}

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
            isFilingPending={isFilingPending}
          />
        )}
        {activeTab === 'expense' && (
          <VatInvoiceTab
            invoiceType="expense"
            workItemId={workItem.id}
            workItem={workItem}
            invoices={invoices}
            isFilingPending={isFilingPending}
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
