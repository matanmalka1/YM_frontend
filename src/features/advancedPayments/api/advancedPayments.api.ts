import { api } from '@/api/client'
import { ADVANCE_PAYMENT_ENDPOINTS } from './endpoints'
import { toQueryParams } from '@/api/queryParams'
import type { PaginatedResponse } from '@/types'
import type {
  AdvancePaymentRow,
  ListAdvancePaymentsParams,
  CreateAdvancePaymentPayload,
  UpdateAdvancePaymentPayload,
  ListAdvancePaymentsOverviewParams,
  AdvancePaymentOverviewResponse,
  AnnualKPIResponse,
  MonthBatchSummary,
  PrefillTurnoverResponse,
  GenerateScheduleResponse,
} from './contracts'

export const advancePaymentsApi = {
  list: async (params: ListAdvancePaymentsParams): Promise<PaginatedResponse<AdvancePaymentRow>> => {
    const { client_record_id, ...queryParams } = params
    const response = await api.get<PaginatedResponse<AdvancePaymentRow>>(
      ADVANCE_PAYMENT_ENDPOINTS.clientAdvancePayments(client_record_id),
      { params: toQueryParams(queryParams) },
    )
    return response.data
  },

  create: async (clientId: number, payload: CreateAdvancePaymentPayload): Promise<AdvancePaymentRow> => {
    const response = await api.post<AdvancePaymentRow>(
      ADVANCE_PAYMENT_ENDPOINTS.clientAdvancePayments(clientId),
      payload,
    )
    return response.data
  },

  update: async (clientId: number, id: number, payload: UpdateAdvancePaymentPayload): Promise<AdvancePaymentRow> => {
    const response = await api.patch<AdvancePaymentRow>(
      ADVANCE_PAYMENT_ENDPOINTS.clientAdvancePaymentById(clientId, id),
      payload,
    )
    return response.data
  },

  overview: async (params: ListAdvancePaymentsOverviewParams): Promise<AdvancePaymentOverviewResponse> => {
    const response = await api.get<AdvancePaymentOverviewResponse>(ADVANCE_PAYMENT_ENDPOINTS.advancePaymentsOverview, {
      params: toQueryParams(params),
    })
    return response.data
  },

  delete: async (clientId: number, id: number): Promise<void> => {
    await api.delete(ADVANCE_PAYMENT_ENDPOINTS.clientAdvancePaymentById(clientId, id))
  },

  getAnnualKPIs: async (clientId: number, year: number): Promise<AnnualKPIResponse> => {
    const response = await api.get<AnnualKPIResponse>(ADVANCE_PAYMENT_ENDPOINTS.clientAdvancePaymentsKPI(clientId), {
      params: toQueryParams({ year }),
    })
    return response.data
  },

  getBatches: async (year: number | null, clientRecordId?: number): Promise<MonthBatchSummary[]> => {
    const response = await api.get<MonthBatchSummary[]>(ADVANCE_PAYMENT_ENDPOINTS.advancePaymentsBatches, {
      params: toQueryParams({
        ...(year !== null ? { year } : {}),
        ...(clientRecordId ? { client_record_id: clientRecordId } : {}),
      }),
    })
    return response.data
  },

  getPrefillTurnover: async (
    clientId: number,
    period: string,
    periodMonthsCount: 1 | 2,
  ): Promise<PrefillTurnoverResponse> => {
    const response = await api.get<PrefillTurnoverResponse>(
      ADVANCE_PAYMENT_ENDPOINTS.clientAdvancePaymentPrefillTurnover(clientId),
      { params: toQueryParams({ period, period_months_count: periodMonthsCount }) },
    )
    return response.data
  },

  generateSchedule: async (
    clientId: number,
    year: number,
    periodMonthsCount?: 1 | 2,
    referenceDate?: string,
  ): Promise<GenerateScheduleResponse> => {
    const payload = {
      year,
      ...(periodMonthsCount == null ? {} : { period_months_count: periodMonthsCount }),
      ...(referenceDate == null ? {} : { reference_date: referenceDate }),
    }
    const response = await api.post<GenerateScheduleResponse>(
      ADVANCE_PAYMENT_ENDPOINTS.clientAdvancePaymentsGenerate(clientId),
      payload,
    )
    return response.data
  },
}
