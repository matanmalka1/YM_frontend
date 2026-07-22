// Public surface of the clients feature — only import from this barrel externally
export { clientsApi, clientsQK } from './api'
export { CLIENT_ENDPOINTS, CLIENT_ROUTES } from './api/endpoints'
export { CLIENT_STATUS_BADGE_VARIANTS, getClientStatusLabel, getVatTypeLabel } from './constants'

export { CreateClientModal } from './components/form/CreateClientModal'
export { DeletedClientDialog } from './components/dialogs/DeletedClientDialog'
export { ClientSidebar } from './components/sidebar/ClientSidebar'

export { extractClientErrorCode } from './utils/clientErrors'
export type { ClientRecordResponse, BusinessResponse, BusinessStatus } from './api'
