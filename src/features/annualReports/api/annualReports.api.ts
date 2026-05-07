import { api } from '@/api/client'
import { toQueryParams } from '@/api/queryParams'
import { ANNUAL_REPORT_ENDPOINTS } from './endpoints'
import type {
  AnnualReportFull,
  AnnualReportListResponse,
  AnnualReportScheduleKey,
  CreateAnnualReportPayload,
  ReportDetailResponse,
  ScheduleEntry,
  StatusHistoryPagedResponse,
  AnnexDataPagedResponse,
  AnnexDataLine,
  AnnexDataAddPayload,
} from './contracts'

export const annualReportsApi = {
  createReport: async (payload: CreateAnnualReportPayload): Promise<AnnualReportFull> => {
    const response = await api.post<AnnualReportFull>(ANNUAL_REPORT_ENDPOINTS.list, payload)
    return response.data
  },

  getReport: async (reportId: number): Promise<AnnualReportFull> => {
    const response = await api.get<AnnualReportFull>(ANNUAL_REPORT_ENDPOINTS.byId(reportId))
    return response.data
  },

  listReports: async (params: {
    tax_year?: number
    page?: number
    page_size?: number
  }): Promise<AnnualReportListResponse> => {
    const response = await api.get<AnnualReportListResponse>(ANNUAL_REPORT_ENDPOINTS.list, {
      params: toQueryParams(params),
    })
    return response.data
  },

  listClientReports: async (clientId: number): Promise<AnnualReportFull[]> => {
    const response = await api.get<AnnualReportListResponse>(ANNUAL_REPORT_ENDPOINTS.clientReports(clientId))
    return response.data.items
  },

  addSchedule: async (
    reportId: number,
    payload: { schedule: AnnualReportScheduleKey; notes?: string | null },
  ): Promise<ScheduleEntry> => {
    const response = await api.post<ScheduleEntry>(ANNUAL_REPORT_ENDPOINTS.schedules(reportId), payload)
    return response.data
  },

  completeSchedule: async (reportId: number, schedule: AnnualReportScheduleKey): Promise<ScheduleEntry> => {
    const response = await api.post<ScheduleEntry>(ANNUAL_REPORT_ENDPOINTS.completeSchedules(reportId), {
      schedule,
    })
    return response.data
  },

  getHistory: async (reportId: number): Promise<StatusHistoryPagedResponse> => {
    const response = await api.get<StatusHistoryPagedResponse>(ANNUAL_REPORT_ENDPOINTS.history(reportId))
    return response.data
  },

  patchReportDetails: async (
    reportId: number,
    payload: Partial<ReportDetailResponse>,
  ): Promise<ReportDetailResponse> => {
    const response = await api.patch<ReportDetailResponse>(
      ANNUAL_REPORT_ENDPOINTS.details(reportId),
      payload,
    )
    return response.data
  },

  deleteReport: async (reportId: number): Promise<void> => {
    await api.delete(ANNUAL_REPORT_ENDPOINTS.byId(reportId))
  },

  getAnnexLines: async (reportId: number, schedule: AnnualReportScheduleKey): Promise<AnnexDataPagedResponse> => {
    const response = await api.get<AnnexDataPagedResponse>(
      ANNUAL_REPORT_ENDPOINTS.annex(reportId, schedule),
    )
    return response.data
  },

  addAnnexLine: async (
    reportId: number,
    schedule: AnnualReportScheduleKey,
    payload: AnnexDataAddPayload,
  ): Promise<AnnexDataLine> => {
    const response = await api.post<AnnexDataLine>(
      ANNUAL_REPORT_ENDPOINTS.annex(reportId, schedule),
      payload,
    )
    return response.data
  },

  updateAnnexLine: async (
    reportId: number,
    schedule: AnnualReportScheduleKey,
    lineId: number,
    payload: AnnexDataAddPayload,
  ): Promise<AnnexDataLine> => {
    const response = await api.patch<AnnexDataLine>(
      ANNUAL_REPORT_ENDPOINTS.annexLine(reportId, schedule, lineId),
      payload,
    )
    return response.data
  },

  deleteAnnexLine: async (reportId: number, schedule: AnnualReportScheduleKey, lineId: number): Promise<void> => {
    await api.delete(ANNUAL_REPORT_ENDPOINTS.annexLine(reportId, schedule, lineId))
  },

  taxPreview: async (payload: {
    tax_year: number
    gross_income: number
    expenses: number
    advances_paid: number
    credit_points: number
  }): Promise<{ net_profit: number; estimated_tax: number; balance: number }> => {
    const response = await api.post<{ net_profit: number; estimated_tax: number; balance: number }>(
      ANNUAL_REPORT_ENDPOINTS.taxPreview,
      payload,
    )
    return response.data
  },

  amend: async (reportId: number, reason: string): Promise<AnnualReportFull> => {
    const response = await api.post<AnnualReportFull>(ANNUAL_REPORT_ENDPOINTS.amend(reportId), {
      reason,
    })
    return response.data
  },

  exportPdf: async (reportId: number, taxYear: number): Promise<void> => {
    const response = await api.get<Blob>(ANNUAL_REPORT_ENDPOINTS.exportPdf(reportId), {
      responseType: 'blob',
    })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `annual_report_${reportId}_${taxYear}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}
