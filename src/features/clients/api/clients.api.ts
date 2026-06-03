import { api } from '@/api/client'
import { BUSINESS_ENDPOINTS } from '@/features/businesses'
import { toQueryParams } from '@/api/queryParams'
import { CLIENT_ENDPOINTS } from './endpoints'
import type {
  ClientRecordResponse,
  ClientRecordListResponse,
  ListClientsParams,
  ClientSidebarListResponse,
  ListClientSidebarParams,
  ClientConflictInfo,
  BusinessResponse,
  ClientBusinessesResponse,
  BusinessStatusCardResponse,
  CreateClientRecordResponse,
  CreateClientPayload,
  ClientImpactPreviewPayload,
  UpdateClientPayload,
  CreateBusinessPayload,
  UpdateBusinessPayload,
  ClientCreationImpactResponse,
} from './contracts'

const CLIENT_BUSINESSES_PAGE_SIZE = 100

export const clientsApi = {
  // ── Queries ──────────────────────────────────────────────────────────────

  list: async (params: ListClientsParams): Promise<ClientRecordListResponse> => {
    const response = await api.get<ClientRecordListResponse>(CLIENT_ENDPOINTS.clients, {
      params: toQueryParams(params),
    })
    return response.data
  },

  listSidebar: async (params: ListClientSidebarParams): Promise<ClientSidebarListResponse> => {
    const response = await api.get<ClientSidebarListResponse>(CLIENT_ENDPOINTS.clientsSidebar, {
      params: toQueryParams(params),
    })
    return response.data
  },

  getById: async (clientId: number, taxYear?: number): Promise<ClientRecordResponse> => {
    const response = await api.get<ClientRecordResponse>(CLIENT_ENDPOINTS.clientById(clientId), {
      params: taxYear ? { tax_year: taxYear } : undefined,
    })
    return response.data
  },

  getConflictByIdNumber: async (idNumber: string): Promise<ClientConflictInfo> => {
    const response = await api.get<ClientConflictInfo>(CLIENT_ENDPOINTS.clientConflictByIdNumber(idNumber))
    return response.data
  },

  getBusinessById: async (clientId: number, businessId: number): Promise<BusinessResponse> => {
    const response = await api.get<BusinessResponse>(BUSINESS_ENDPOINTS.businessById(clientId, businessId))
    return response.data
  },

  listBusinessesForClient: async (
    clientId: number,
    params?: { page?: number; page_size?: number },
  ): Promise<ClientBusinessesResponse> => {
    const response = await api.get<ClientBusinessesResponse>(
      BUSINESS_ENDPOINTS.clientBusinesses(clientId),
      params ? { params: toQueryParams(params) } : undefined,
    )
    return response.data
  },

  listAllBusinessesForClient: async (clientId: number): Promise<ClientBusinessesResponse> => {
    let page = 1
    let total: number
    let client_id: number
    const items: BusinessResponse[] = []

    while (true) {
      const response = await clientsApi.listBusinessesForClient(clientId, {
        page,
        page_size: CLIENT_BUSINESSES_PAGE_SIZE,
      })
      client_id = response.client_id
      total = response.total
      items.push(...response.items)

      if (items.length >= total || response.items.length < CLIENT_BUSINESSES_PAGE_SIZE) {
        break
      }
      page += 1
    }

    return {
      client_id,
      items,
      page: 1,
      page_size: items.length,
      total,
    }
  },

  getStatusCard: async (clientId: number, year?: number): Promise<BusinessStatusCardResponse> => {
    const response = await api.get<BusinessStatusCardResponse>(CLIENT_ENDPOINTS.clientStatusCard(clientId), {
      params: year ? { year } : undefined,
    })
    return response.data
  },

  // ── Mutations ────────────────────────────────────────────────────────────

  create: async (payload: CreateClientPayload): Promise<CreateClientRecordResponse> => {
    const { business_name, business_opened_at, ...clientPayload } = payload
    const response = await api.post<CreateClientRecordResponse>(CLIENT_ENDPOINTS.clients, {
      client: clientPayload,
      business: {
        business_name,
        opened_at: business_opened_at ?? null,
      },
    })
    return response.data
  },

  previewImpact: async (payload: ClientImpactPreviewPayload): Promise<ClientCreationImpactResponse> => {
    const response = await api.post<ClientCreationImpactResponse>(CLIENT_ENDPOINTS.clientsPreviewImpact, {
      client: payload,
    })
    return response.data
  },

  update: async (clientId: number, payload: UpdateClientPayload): Promise<ClientRecordResponse> => {
    const response = await api.patch<ClientRecordResponse>(CLIENT_ENDPOINTS.clientById(clientId), payload)
    return response.data
  },

  delete: async (clientId: number): Promise<void> => {
    await api.delete(CLIENT_ENDPOINTS.clientById(clientId))
  },

  restore: async (clientId: number): Promise<ClientRecordResponse> => {
    const response = await api.post<ClientRecordResponse>(CLIENT_ENDPOINTS.clientRestore(clientId))
    return response.data
  },

  createBusiness: async (clientId: number, payload: CreateBusinessPayload): Promise<BusinessResponse> => {
    const response = await api.post<BusinessResponse>(BUSINESS_ENDPOINTS.clientBusinesses(clientId), payload)
    return response.data
  },

  updateBusiness: async (
    clientId: number,
    businessId: number,
    payload: UpdateBusinessPayload,
  ): Promise<BusinessResponse> => {
    const response = await api.patch<BusinessResponse>(BUSINESS_ENDPOINTS.businessById(clientId, businessId), payload)
    return response.data
  },

  deleteBusiness: async (clientId: number, businessId: number): Promise<void> => {
    await api.delete(BUSINESS_ENDPOINTS.businessById(clientId, businessId))
  },

  restoreBusiness: async (clientId: number, businessId: number): Promise<BusinessResponse> => {
    const response = await api.post<BusinessResponse>(BUSINESS_ENDPOINTS.businessRestore(clientId, businessId))
    return response.data
  },
}
