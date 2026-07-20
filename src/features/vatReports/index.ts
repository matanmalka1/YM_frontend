// Public surface of the vatReports feature — only import from this barrel externally
export { vatReportsApi, vatReportsQK } from './api'
export { VatWorkItemsCreateModal } from './components/form/VatWorkItemsCreateModal'
export { VatWorkItemsStatsSection } from './components/list/VatWorkItemsStatsSection'

export { VatWorkItemsGroupedCards } from './components/list/VatWorkItemsGroupedCards'
export { useVatWorkItemsPage } from './hooks/useVatWorkItemsPage'

export { VatWorkItemDetail } from './pages/VatWorkItemDetailPage'
export { VatWorkItemFullPanel } from './components/detail/VatWorkItemFullPanel'
export { VatWorkItems } from './pages/VatWorkItemsPage'
export { VatClientSummaryPanel } from './components/detail/VatClientSummaryPanel'
export { getVatWorkItemStatusLabel, getVatWorkItemStatusVariant, CATEGORY_LABELS } from './constants/vatConstants'
export type { CreateVatWorkItemPayload } from './api'
