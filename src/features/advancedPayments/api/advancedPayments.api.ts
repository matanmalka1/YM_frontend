import { api } from '@/api/client'
import { ADVANCE_PAYMENT_ENDPOINTS } from './endpoints'
import { toQueryParams } from '@/api/queryParams'
import { randomUUID } from '@/utils/random'
import type { PaginatedResponse } from '@/types'
import type {
  AdvancePaymentRow,
  ListAdvancePaymentsParams,
  CreateAdvancePaymentPayload,
  DeleteAdvancePaymentPayload,
  UpdateAdvancePaymentPayload,
  ListAdvancePaymentsOverviewParams,
  AdvancePaymentOverviewResponse,
  AnnualKPIResponse,
  MonthBatchSummary,
  BulkMarkPaidPayload,
  BulkMarkPaidResponse,
  BulkRateUpdatePayload,
  BulkRateUpdateResponse,
  BulkRefreshTurnoverResponse,
  BulkGeneratePayload,
  BulkGeneratePreviewResponse,
  BulkGenerateResponse,
  GenerateScheduleResponse,
} from './contracts'

export const advancePaymentsApi = {
  list: async (params: ListAdvancePaymentsParams): Promise<PaginatedResponse<AdvancePaymentRow>> => {
    const { client_record_id, ...queryParams } = params
    const response = await api.get<PaginatedResponse<AdvancePaymentRow>>(
      ADVANCE_PAYMENT_ENDPOINTS.clientAdvancePayments(client_record_id),
      {
        params: toQueryParams(queryParams),
      },
    )
    return response.data
  },

  create: async (clientRecordId: number, payload: CreateAdvancePaymentPayload): Promise<AdvancePaymentRow> => {
    const response = await api.post<AdvancePaymentRow>(ADVANCE_PAYMENT_ENDPOINTS.clientAdvancePayments(clientRecordId), payload)
    return response.data
  },

  getById: async (clientRecordId: number, id: number): Promise<AdvancePaymentRow> => {
    const response = await api.get<AdvancePaymentRow>(ADVANCE_PAYMENT_ENDPOINTS.clientAdvancePaymentById(clientRecordId, id))
    return response.data
  },

  update: async (clientRecordId: number, id: number, payload: UpdateAdvancePaymentPayload): Promise<AdvancePaymentRow> => {
    const response = await api.patch<AdvancePaymentRow>(
      ADVANCE_PAYMENT_ENDPOINTS.clientAdvancePaymentById(clientRecordId, id),
      payload,
    )
    return response.data
  },

  bulkMarkPaid: async (payload: BulkMarkPaidPayload): Promise<BulkMarkPaidResponse> => {
    const response = await api.post<BulkMarkPaidResponse>(ADVANCE_PAYMENT_ENDPOINTS.advancePaymentsBulkMarkPaid, payload, {
      headers: { 'X-Idempotency-Key': randomUUID() },
    })
    return response.data
  },

  overview: async (params: ListAdvancePaymentsOverviewParams): Promise<AdvancePaymentOverviewResponse> => {
    const response = await api.get<AdvancePaymentOverviewResponse>(ADVANCE_PAYMENT_ENDPOINTS.advancePaymentsOverview, {
      params: toQueryParams(params),
    })
    return response.data
  },

  delete: async (clientRecordId: number, id: number, payload: DeleteAdvancePaymentPayload): Promise<void> => {
    await api.delete(ADVANCE_PAYMENT_ENDPOINTS.clientAdvancePaymentById(clientRecordId, id), { data: payload })
  },

  bulkRateUpdate: async (clientRecordId: number, payload: BulkRateUpdatePayload): Promise<BulkRateUpdateResponse> => {
    const response = await api.post<BulkRateUpdateResponse>(
      ADVANCE_PAYMENT_ENDPOINTS.clientAdvancePaymentsBulkRateUpdate(clientRecordId),
      payload,
      { headers: { 'X-Idempotency-Key': randomUUID() } },
    )
    return response.data
  },

  getAnnualKPIs: async (clientRecordId: number, year: number): Promise<AnnualKPIResponse> => {
    const response = await api.get<AnnualKPIResponse>(ADVANCE_PAYMENT_ENDPOINTS.clientAdvancePaymentsKPI(clientRecordId), {
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

  refreshTurnoverBulk: async (clientRecordId: number, paymentIds: number[]): Promise<BulkRefreshTurnoverResponse> => {
    const response = await api.post<BulkRefreshTurnoverResponse>(
      ADVANCE_PAYMENT_ENDPOINTS.clientAdvancePaymentsRefreshTurnover(clientRecordId),
      {
        payment_ids: paymentIds,
      },
    )
    return response.data
  },

  refreshTurnover: async (clientRecordId: number, paymentId: number, confirmPending = false): Promise<AdvancePaymentRow> => {
    const response = await api.post<AdvancePaymentRow>(
      ADVANCE_PAYMENT_ENDPOINTS.clientAdvancePaymentRefreshTurnover(clientRecordId, paymentId),
      {
        confirm_pending: confirmPending,
      },
    )
    return response.data
  },

  generateSchedule: async (
    clientRecordId: number,
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
      ADVANCE_PAYMENT_ENDPOINTS.clientAdvancePaymentsGenerate(clientRecordId),
      payload,
    )
    return response.data
  },

  bulkGeneratePreview: async (): Promise<BulkGeneratePreviewResponse> => {
    const response = await api.get<BulkGeneratePreviewResponse>(ADVANCE_PAYMENT_ENDPOINTS.advancePaymentsBulkGeneratePreview)
    return response.data
  },

  // The idempotency key is the caller's, not a fresh UUID per call: an office-wide
  // run is a sequence of chunk requests, and retrying one chunk must reuse its key
  // so the retry cannot create the same schedules twice.
  bulkGenerate: async (payload: BulkGeneratePayload, idempotencyKey: string): Promise<BulkGenerateResponse> => {
    const response = await api.post<BulkGenerateResponse>(ADVANCE_PAYMENT_ENDPOINTS.advancePaymentsBulkGenerate, payload, {
      headers: { 'X-Idempotency-Key': idempotencyKey },
    })
    return response.data
  },
}
