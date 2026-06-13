import { api } from '@/api/client'
import { toQueryParams } from '@/api/queryParams'
import { CORRESPONDENCE_ENDPOINTS } from './endpoints'
import type {
  CorrespondenceEntry,
  CorrespondenceListResponse,
  CreateCorrespondencePayload,
  ListCorrespondenceParams,
  UpdateCorrespondencePayload,
} from './contracts'

export const correspondenceApi = {
  list: async (clientId: number, params?: ListCorrespondenceParams): Promise<CorrespondenceListResponse> => {
    const response = await api.get<CorrespondenceListResponse>(CORRESPONDENCE_ENDPOINTS.correspondenceList(clientId), {
      params: params ? toQueryParams(params) : undefined,
    })
    return response.data
  },

  create: async (clientId: number, payload: CreateCorrespondencePayload): Promise<CorrespondenceEntry> => {
    const response = await api.post<CorrespondenceEntry>(CORRESPONDENCE_ENDPOINTS.correspondenceList(clientId), payload)
    return response.data
  },

  update: async (clientId: number, id: number, payload: UpdateCorrespondencePayload): Promise<CorrespondenceEntry> => {
    const response = await api.patch<CorrespondenceEntry>(
      CORRESPONDENCE_ENDPOINTS.correspondenceById(clientId, id),
      payload,
    )
    return response.data
  },

  delete: async (clientId: number, id: number): Promise<void> => {
    await api.delete(CORRESPONDENCE_ENDPOINTS.correspondenceById(clientId, id))
  },
}
