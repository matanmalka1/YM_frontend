import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, ArrowUpCircle, Clock } from 'lucide-react'
import { Alert } from '@/components/ui/overlays/Alert'
import { Badge } from '@/components/ui/primitives/Badge'
import { TableSkeleton } from '@/components/ui/table/TableSkeleton'
import { cn } from '@/utils/utils'
import {
  isFiled,
  useVatWorkItemPage,
  VatFiledBanner,
  VatHistoryTab,
  VatSummaryTab,
  VatWorkItemSummaryBar,
  VatInvoiceTab,
} from '@/features/vatReports'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'

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
  if (isError || !workItem) return <Alert variant="error" message='שגיאה בטעינת תיק מע"מ' />

  const incomeCount = invoices.filter((i) => i.invoice_type === 'income').length
  const expenseCount = invoices.filter((i) => i.invoice_type === 'expense').length

  const tabs: { key: TabKey; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: 'summary', label: 'סיכום', icon: LayoutDashboard },
    { key: 'income', label: 'עסקאות', icon: ClipboardList, badge: incomeCount },
    { key: 'expense', label: 'תשומות', icon: ArrowUpCircle, badge: expenseCount },
    { key: 'history', label: 'היסטוריה', icon: Clock },
  ]

  return (
    <div className="space-y-4">
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

      <div role="tablist" dir="rtl" className="flex gap-1 border-b border-gray-200 bg-white/95 px-1 backdrop-blur-sm">
        {tabs.map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => setTab(key)}
            className={cn(
              'inline-flex items-center gap-2 rounded-t-lg border-b-2 px-5 py-3 text-sm font-medium transition-colors focus:outline-none',
              activeTab === key
                ? 'border-primary-600 bg-primary-50 text-primary-800 shadow-sm'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
            {badge !== undefined && (
              <Badge
                variant="neutral"
                className={cn(
                  'min-w-[1.35rem] rounded-full px-1.5 py-0.5 text-center text-xs tabular-nums',
                  activeTab === key && 'bg-white text-primary-800 ring-1 ring-primary-200',
                )}
              >
                {badge}
              </Badge>
            )}
          </button>
        ))}
      </div>

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
