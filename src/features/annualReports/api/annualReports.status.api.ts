import { api } from '@/api/client'
import { ANNUAL_REPORT_ENDPOINTS } from './endpoints'
import type { AnnualReportFull, StatusTransitionPayload } from './contracts'

export const annualReportStatusApi = {
  transitionStatus: async (reportId: number, payload: StatusTransitionPayload): Promise<void> => {
    await api.post(ANNUAL_REPORT_ENDPOINTS.status(reportId), payload)
  },

  submitReport: async (
    reportId: number,
    payload: {
      submitted_at?: string
      ita_reference?: string | null
      submission_method?: string | null
      note?: string | null
    } = {},
  ): Promise<AnnualReportFull> => {
    const response = await api.post<AnnualReportFull>(ANNUAL_REPORT_ENDPOINTS.submit(reportId), payload)
    return response.data
  },
}
