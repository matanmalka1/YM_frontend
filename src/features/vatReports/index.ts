// Public surface of the vatReports feature — only import from this barrel externally
export { vatReportsApi, vatReportsQK } from './api'
export { VatWorkItemsCreateModal } from './components/form/VatWorkItemsCreateModal'
export { useVatDeductionMetadata } from './hooks/useVatDeductionMetadata'

export { VatWorkItemFullPanel } from './components/detail/VatWorkItemFullPanel'
export { VatClientSummaryPanel } from './components/detail/VatClientSummaryPanel'
export { getVatWorkItemStatusLabel } from './constants/vatConstants'
export { VAT_ERROR_MESSAGES } from './errorMessages'
export { VAT_MESSAGES } from './messages'
export type { CreateVatWorkItemPayload } from './api'
