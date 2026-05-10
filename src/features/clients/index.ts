// Public surface of the clients feature — only import from this barrel externally
export { clientsApi, clientsQK } from './api'
export { CLIENT_ENDPOINTS, CLIENT_ROUTES } from './api/endpoints'
export { ClientEditForm } from './components/edit/ClientEditForm'
export { buildClientColumns } from './components/list/ClientColumns'
export { ClientDetailsTabContent } from './components/details/ClientDetailsTabContent'
export { ClientsFiltersBar } from './components/list/ClientsFiltersBar'
export { CreateClientModal } from './components/createClientModal/CreateClientModal'
export { DeletedClientDialog } from './components/dialogs/DeletedClientDialog'
export { useClientDetails } from './hooks/useClientDetails'
export { useClientsPage } from './hooks/useClientsPage'
export { useFirstBusinessId } from './hooks/useFirstBusinessId'
export { useClientDetailsActions } from './hooks/useClientDetailsActions'
export { ClientDetails } from './pages/ClientDetailsPage'
export { Clients } from './pages/ClientsPage'
export { extractClientErrorCode } from './utils/clientErrors'
export type {
  ClientRecordResponse,
  BusinessResponse,
  BusinessWithClientResponse,
  BusinessListResponse,
  BusinessStatus,
  VatType,
  ISODateString,
} from './api'
