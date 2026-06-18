// Public surface of the vatReports feature — only import from this barrel externally
export { vatReportsApi, vatReportsQK } from './api'
export { VatInvoiceTab } from './components/VatInvoiceTab'
export { VatFiledBanner } from './components/VatFiledBanner'
export { VatHistoryTab } from './components/VatHistoryTab'
export { VatSummaryTab } from './components/VatSummaryTab'

export { VatWorkItemSummaryBar } from './components/VatWorkItemSummaryBar'
export { VatWorkItemsCreateModal } from './components/VatWorkItemsCreateModal'
export { VatWorkItemsFiltersCard } from './components/VatWorkItemsFiltersCard'

export { VatWorkItemsGroupedCards } from './components/VatWorkItemsGroupedCards'
export { useVatWorkItemPage } from './hooks/useVatWorkItemPage'
export { useVatWorkItemsPage } from './hooks/useVatWorkItemsPage'

export { VatWorkItemDetail } from './pages/VatWorkItemDetailPage'
export { VatWorkItems } from './pages/VatWorkItemsPage'
export { VatClientSummaryPanel } from './components/VatClientSummaryPanel'
export { isFiled } from './utils'
export { getVatWorkItemStatusLabel, getVatWorkItemStatusVariant, CATEGORY_LABELS } from './constants'
export type { CreateVatWorkItemPayload } from './api'
