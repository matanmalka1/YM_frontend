import { LayoutDashboard, ClipboardList, ArrowUpCircle, Clock } from 'lucide-react'
import { useSearchParamFilters } from '@/hooks/useSearchParamFilters'
import { useVatWorkItemPage } from './useVatWorkItemPage'
import { isFiled } from '../utils/vatHelpers'
import { formatVatPeriodTitle, getVatClientTitle } from '../utils/viewHelpers'
import { VAT_MESSAGES } from '../messages'
import { VAT_ERROR_MESSAGES } from '../errorMessages'
import type { VatFiledBannerProps } from '../types'

export type VatDetailTabKey = 'summary' | 'income' | 'expense' | 'history'

const TAB_KEYS = ['summary', 'income', 'expense', 'history'] as const

const isTabKey = (tab: string | null): tab is VatDetailTabKey => TAB_KEYS.some((tabKey) => tabKey === tab)

interface VatDetailTab {
  key: VatDetailTabKey
  label: string
  icon: React.ElementType
  badge?: number
}

export const useVatWorkItemDetailPage = (workItemId: number) => {
  const { searchParams, setSearchParams } = useSearchParamFilters()
  const { workItem, invoices, isLoading, isError } = useVatWorkItemPage(workItemId)

  const requestedTab = searchParams.get('tab')
  const activeTab = isTabKey(requestedTab) ? requestedTab : 'summary'
  const setTab = (tab: VatDetailTabKey) => setSearchParams(tab === 'summary' ? {} : { tab })

  const error = isError || (!isLoading && !workItem) ? VAT_ERROR_MESSAGES.detail.loadingWorkItemError : null

  const incomeCount = invoices.filter((invoice) => invoice.invoice_type === 'income').length
  const expenseCount = invoices.filter((invoice) => invoice.invoice_type === 'expense').length

  const tabs: VatDetailTab[] = [
    { key: 'summary', label: VAT_MESSAGES.detail.tabSummary, icon: LayoutDashboard },
    { key: 'income', label: VAT_MESSAGES.detail.tabIncome, icon: ClipboardList, badge: incomeCount },
    { key: 'expense', label: VAT_MESSAGES.detail.tabExpense, icon: ArrowUpCircle, badge: expenseCount },
    { key: 'history', label: VAT_MESSAGES.detail.tabHistory, icon: Clock },
  ]

  const headerProps = workItem
    ? {
        breadcrumbs: [
          { label: VAT_MESSAGES.detail.breadcrumbList, to: '/tax/vat' },
          { label: VAT_MESSAGES.detail.breadcrumbCurrent },
        ],
        title: `${getVatClientTitle(workItem.client_name, workItem.client_record_id)} · ${formatVatPeriodTitle(workItem.period, workItem.period_type)}`,
      }
    : null

  const filedBanner: VatFiledBannerProps | null =
    workItem && isFiled(workItem.status) && workItem.filed_at
      ? {
          filedAt: workItem.filed_at,
          filedBy: workItem.filed_by,
          filedByName: workItem.filed_by_name,
          filingMethod: workItem.submission_method,
          submissionReference: workItem.submission_reference,
          isAmendment: workItem.is_amendment,
          amendsItemId: workItem.amends_item_id,
        }
      : null

  return {
    status: { isLoading, error },
    workItem,
    invoices,
    headerProps,
    filedBanner,
    tabs,
    activeTab,
    setTab,
  }
}
