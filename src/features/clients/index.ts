// Public surface of the clients feature — only import from this barrel externally
export { clientsApi, clientsQK } from './api'
export { CLIENT_ENDPOINTS, CLIENT_ROUTES } from './api/endpoints'
export { CLIENT_STATUS_OPTIONS, ENTITY_TYPE_OPTIONS, getVatTypeLabel } from './constants'
export { ClientEditForm } from './components/edit/ClientEditForm'
export { buildClientColumns } from './components/list/ClientColumns'
export { ClientDetailsTabContent } from './components/details/ClientDetailsTabContent'
export { ClientsFiltersBar } from './components/list/ClientsFiltersBar'
export { CreateClientModal } from './components/createClientModal/CreateClientModal'
export { DeletedClientDialog } from './components/dialogs/DeletedClientDialog'
export { useClientQuery } from './hooks/useClientQuery'
export { useClientMutations } from './hooks/useClientMutations'
export { useClientsPage } from './hooks/useClientsPage'

export { ClientDetails } from './pages/ClientDetailsPage'
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
