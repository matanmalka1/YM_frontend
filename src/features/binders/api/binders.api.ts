import { api } from '@/api/client'
import { BINDER_ENDPOINTS } from './endpoints'
import { toQueryParams } from '@/api/queryParams'
import type {
  BinderHistoryResponse,
  BinderIntakeListResponse,
  BinderListResponse,
  BinderReceiveResult,
  BinderResponse,
  ListBindersParams,
  ListOperationalBindersParams,
  ReceiveBinderPayload,
  HandoverToClientPayload,
} from '../types'
import type {
  BinderHandoverToClientBulkPayload,
  BinderHandoverToClientBulkResponse,
  BinderListResponseExtended,
  BinderMarkReadyForHandoverBulkPayload,
} from './contracts'

export const bindersApi = {
  list: async (params: ListBindersParams): Promise<BinderListResponse> => {
    const response = await api.get<BinderListResponse>(BINDER_ENDPOINTS.binders, {
      params: toQueryParams(params),
    })
    return response.data
  },

  getBinder: async (binderId: number): Promise<BinderResponse> => {
    const response = await api.get<BinderResponse>(BINDER_ENDPOINTS.binderById(binderId))
    return response.data
  },

  receive: async (payload: ReceiveBinderPayload): Promise<BinderReceiveResult> => {
    const response = await api.post<BinderReceiveResult>(BINDER_ENDPOINTS.binderReceive, payload)
    return response.data
  },

  receiveMaterial: async (binderId: number): Promise<BinderResponse> => {
    const response = await api.post<BinderResponse>(BINDER_ENDPOINTS.binderReceiveMaterial(binderId))
    return response.data
  },

  markFull: async (binderId: number): Promise<BinderResponse> => {
    const response = await api.post<BinderResponse>(BINDER_ENDPOINTS.binderMarkFull(binderId))
    return response.data
  },

  reopenCapacity: async (binderId: number): Promise<BinderResponse> => {
    const response = await api.post<BinderResponse>(BINDER_ENDPOINTS.binderReopenCapacity(binderId))
    return response.data
  },

  markReadyForHandover: async (binderId: number): Promise<BinderResponse> => {
    const response = await api.post<BinderResponse>(BINDER_ENDPOINTS.binderMarkReadyForHandover(binderId))
    return response.data
  },

  markReadyForHandoverBulk: async (payload: BinderMarkReadyForHandoverBulkPayload): Promise<BinderResponse[]> => {
    const response = await api.post<BinderResponse[]>(BINDER_ENDPOINTS.binderMarkReadyForHandoverBulk, payload)
    return response.data
  },

  revertReadyForHandover: async (binderId: number): Promise<BinderResponse> => {
    const response = await api.post<BinderResponse>(BINDER_ENDPOINTS.binderRevertReadyForHandover(binderId))
    return response.data
  },

  handoverToClient: async (binderId: number, payload?: HandoverToClientPayload): Promise<BinderResponse> => {
    const response = await api.post<BinderResponse>(BINDER_ENDPOINTS.binderHandoverToClient(binderId), payload)
    return response.data
  },

  handoverToClientBulk: async (
    payload: BinderHandoverToClientBulkPayload,
  ): Promise<BinderHandoverToClientBulkResponse> => {
    const response = await api.post<BinderHandoverToClientBulkResponse>(
      BINDER_ENDPOINTS.binderHandoverToClientBulk,
      payload,
    )
    return response.data
  },

  getOpenBinders: async (params?: { page?: number; page_size?: number }): Promise<BinderListResponseExtended> => {
    const response = await api.get<BinderListResponseExtended>(BINDER_ENDPOINTS.bindersOpen, {
      params,
    })
    return response.data
  },

  listClientBinders: async (
    clientId: number,
    params: ListOperationalBindersParams,
  ): Promise<BinderListResponseExtended> => {
    const response = await api.get<BinderListResponseExtended>(BINDER_ENDPOINTS.clientBinders(clientId), {
      params: toQueryParams(params),
    })
    return response.data
  },

  delete: async (binderId: number): Promise<void> => {
    await api.delete(BINDER_ENDPOINTS.binderById(binderId))
  },

  getHistory: async (binderId: number): Promise<BinderHistoryResponse> => {
    const response = await api.get<BinderHistoryResponse>(BINDER_ENDPOINTS.binderHistory(binderId))
    return response.data
  },

  getIntakes: async (binderId: number): Promise<BinderIntakeListResponse> => {
    const response = await api.get<BinderIntakeListResponse>(BINDER_ENDPOINTS.binderIntakes(binderId))
    return response.data
  },
}
