// Public surface of the vatReports feature — only import from this barrel externally
export { vatReportsApi, vatReportsQK } from './api'
export { VatInvoiceTab } from './components/VatInvoiceTab'
export { VatFiledBanner } from './components/VatFiledBanner'
export { VatHistoryTab } from './components/VatHistoryTab'
export { VatSummaryTab } from './components/VatSummaryTab'
export { buildVatWorkItemColumns } from './components/VatWorkItemColumns'
export { VatWorkItemSummaryBar } from './components/VatWorkItemSummaryBar'
export { VatWorkItemsCreateModal } from './components/VatWorkItemsCreateModal'
export { VatWorkItemsFiltersCard } from './components/VatWorkItemsFiltersCard'
export { VatWorkItemsGroupedTable } from './components/VatWorkItemsGroupedTable'
export { VatWorkItemsGroupedCards } from './components/VatWorkItemsGroupedCards'
export { useVatWorkItemPage } from './hooks/useVatWorkItemPage'
export { useVatWorkItemsPage } from './hooks/useVatWorkItemsPage'
export { useVatWorkItemGroups } from './hooks/useVatWorkItemGroups'
export { VatWorkItemDetail } from './pages/VatWorkItemDetailPage'
export { VatWorkItems } from './pages/VatWorkItemsPage'
export { VatClientSummaryPanel } from './components/VatClientSummaryPanel'
export { isFiled } from './utils'
export {
  VAT_STATUS_BADGE_VARIANTS,
  getVatWorkItemStatusLabel,
  VAT_WORK_ITEM_STATUS_LABELS,
  VAT_RATE_TYPE_LABELS,
  DOCUMENT_TYPE_LABELS,
  CATEGORY_LABELS,
} from './constants'
export type { CreateVatWorkItemPayload, VatWorkItemResponse, VatClientSummaryResponse } from './api'
