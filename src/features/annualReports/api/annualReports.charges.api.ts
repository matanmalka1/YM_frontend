import { api } from '@/api/client'
import { ANNUAL_REPORT_ENDPOINTS } from './endpoints'
import type { ChargesListResponse } from './contracts'

export const annualReportChargesApi = {
  listCharges: async (reportId: number, page = 1, pageSize = 20): Promise<ChargesListResponse> => {
    const response = await api.get<ChargesListResponse>(
      `${ANNUAL_REPORT_ENDPOINTS.charges(reportId)}?page=${page}&page_size=${pageSize}`,
    )
    return response.data
  },
}
