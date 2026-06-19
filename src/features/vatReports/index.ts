// Public surface of the vatReports feature — only import from this barrel externally
export { vatReportsApi, vatReportsQK } from './api'
export { VatInvoiceTab } from './components/detail/VatInvoiceTab'
export { VatFiledBanner } from './components/shared/VatFiledBanner'
export { VatHistoryTab } from './components/detail/VatHistoryTab'
export { VatSummaryTab } from './components/detail/VatSummaryTab'

export { VatWorkItemSummaryBar } from './components/list/VatWorkItemSummaryBar'
export { VatWorkItemsCreateModal } from './components/form/VatWorkItemsCreateModal'
export { VatWorkItemsFiltersCard } from './components/list/VatWorkItemsFiltersCard'

export { VatWorkItemsGroupedCards } from './components/list/VatWorkItemsGroupedCards'
export { useVatWorkItemPage } from './hooks/useVatWorkItemPage'
export { useVatWorkItemsPage } from './hooks/useVatWorkItemsPage'

export { VatWorkItemDetail } from './pages/VatWorkItemDetailPage'
export { VatWorkItems } from './pages/VatWorkItemsPage'
export { VatClientSummaryPanel } from './components/detail/VatClientSummaryPanel'
export { isFiled } from './utils/vatHelpers'
export { getVatWorkItemStatusLabel, getVatWorkItemStatusVariant, CATEGORY_LABELS } from './constants'
export type { CreateVatWorkItemPayload } from './api'
