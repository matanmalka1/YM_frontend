// Public surface of the vatReports feature — only import from this barrel externally
export { vatReportsApi, vatReportsQK } from './api'
export { VatWorkItemsCreateModal } from './components/form/VatWorkItemsCreateModal'
export { useVatDeductionMetadata } from './hooks/useVatDeductionMetadata'

export { VatWorkItemFullPanel } from './components/detail/VatWorkItemFullPanel'
export { VatClientSummaryPanel } from './components/detail/VatClientSummaryPanel'
export { getVatWorkItemStatusLabel } from './constants/vatConstants'
export type { CreateVatWorkItemPayload } from './api'
