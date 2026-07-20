import { api } from '@/api/client'
import { CHARGE_ENDPOINTS } from './endpoints'
import { toQueryParams } from '@/api/queryParams'
import { randomUUID } from '@/utils/random'
import type {
  ChargeResponse,
  ChargesListResponse,
  ChargesListParams,
  CreateChargePayload,
  UpdateChargePayload,
  BulkChargeActionPayload,
  BulkChargeActionResult,
} from './contracts'

export const chargesApi = {
  list: async (params: ChargesListParams): Promise<ChargesListResponse> => {
    const response = await api.get<ChargesListResponse>(CHARGE_ENDPOINTS.charges, {
      params: toQueryParams(params),
    })
    return response.data
  },

  getById: async (chargeId: number): Promise<ChargeResponse> => {
    const response = await api.get<ChargeResponse>(CHARGE_ENDPOINTS.chargeById(chargeId))
    return response.data
  },

  create: async (payload: CreateChargePayload): Promise<ChargeResponse> => {
    const response = await api.post<ChargeResponse>(CHARGE_ENDPOINTS.charges, payload)
    return response.data
  },

  update: async (chargeId: number, payload: UpdateChargePayload): Promise<ChargeResponse> => {
    const response = await api.patch<ChargeResponse>(CHARGE_ENDPOINTS.chargeById(chargeId), payload)
    return response.data
  },

  issue: async (chargeId: number): Promise<ChargeResponse> => {
    const response = await api.post<ChargeResponse>(CHARGE_ENDPOINTS.chargeIssue(chargeId))
    return response.data
  },

  markPaid: async (chargeId: number): Promise<ChargeResponse> => {
    const response = await api.post<ChargeResponse>(CHARGE_ENDPOINTS.chargeMarkPaid(chargeId))
    return response.data
  },

  cancel: async (chargeId: number, reason?: string): Promise<ChargeResponse> => {
    const response = await api.post<ChargeResponse>(
      CHARGE_ENDPOINTS.chargeCancel(chargeId),
      reason ? { reason } : undefined,
    )
    return response.data
  },

  delete: async (chargeId: number): Promise<void> => {
    await api.delete(CHARGE_ENDPOINTS.chargeById(chargeId))
  },

  bulkAction: async (payload: BulkChargeActionPayload): Promise<BulkChargeActionResult> => {
    const response = await api.post<BulkChargeActionResult>(CHARGE_ENDPOINTS.chargesBulkAction, payload, {
      headers: {
        'X-Idempotency-Key': randomUUID(),
      },
    })
    return response.data
  },
}
