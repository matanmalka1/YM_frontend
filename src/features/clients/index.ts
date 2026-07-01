// Public surface of the clients feature — only import from this barrel externally
export { clientsApi, clientsQK } from './api'
export { CLIENT_ENDPOINTS, CLIENT_ROUTES } from './api/endpoints'
export {
  CLIENT_STATUS_OPTIONS,
  CLIENT_STATUS_BADGE_VARIANTS,
  ENTITY_TYPE_OPTIONS,
  getClientStatusLabel,
  getVatTypeLabel,
} from './constants'

export { ClientEditDrawer } from './components/drawer/ClientEditDrawer'

export { ClientsStatsSection } from './components/list/ClientsStatsSection'
export { ClientDetailsTabContent } from './components/detail/ClientDetailsTabContent'
export { CreateClientModal } from './components/form/CreateClientModal'
export { DeletedClientDialog } from './components/dialogs/DeletedClientDialog'
export { useClientQuery } from './hooks/useClientQuery'
export { useClientMutations } from './hooks/useClientMutations'
export { useClientsPage } from './hooks/useClientsPage'

export { ClientDetails } from './pages/ClientDetailsPage'
export { ClientAnnualReportDetail } from './pages/ClientAnnualReportDetailPage'
export { Clients } from './pages/ClientsPage'
export { extractClientErrorCode } from './utils/clientErrors'
export type {
  ClientRecordResponse,
  ClientRecordListItem,
  ClientSidebarResponse,
  UpdateClientPayload,
  BusinessResponse,
  BusinessStatus,
} from './api'
