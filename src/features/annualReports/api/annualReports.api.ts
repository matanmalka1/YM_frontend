import { api } from '@/api/client'
import { toQueryParams } from '@/api/queryParams'
import { ANNUAL_REPORT_ENDPOINTS } from './endpoints'
import type {
  AnnualReportFull,
  AnnualReportListResponse,
  AnnualReportListItem,
  AnnualReportChargesResponse,
  AnnualReportScheduleKey,
  CreateAnnualReportPayload,
  ReportDetailResponse,
  ScheduleEntry,
  AnnexDataPagedResponse,
  AnnexDataLine,
  AnnexDataAddPayload,
  TaxPreviewParams,
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
    client_record_id?: number
    status?: string
    page?: number
    page_size?: number
    sort_by?: 'tax_year' | 'status' | 'filing_deadline' | 'created_at' | 'client_record_id'
    order?: 'asc' | 'desc'
  }): Promise<AnnualReportListResponse> => {
    const response = await api.get<AnnualReportListResponse>(ANNUAL_REPORT_ENDPOINTS.list, {
      params: toQueryParams(params),
    })
    return response.data
  },

  listClientReports: async (
    clientId: number,
    params: { page?: number; page_size?: number } = {},
  ): Promise<AnnualReportListItem[]> => {
    const response = await api.get<AnnualReportListResponse>(ANNUAL_REPORT_ENDPOINTS.clientReports(clientId), {
      params: toQueryParams(params),
    })
    return response.data.items
  },

  listReportCharges: async (
    reportId: number,
    params: { page?: number; page_size?: number } = {},
  ): Promise<AnnualReportChargesResponse> => {
    const response = await api.get<AnnualReportChargesResponse>(ANNUAL_REPORT_ENDPOINTS.charges(reportId), {
      params: toQueryParams(params),
    })
    return response.data
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

  patchReportDetails: async (reportId: number, payload: Partial<ReportDetailResponse>): Promise<ReportDetailResponse> => {
    const response = await api.patch<ReportDetailResponse>(ANNUAL_REPORT_ENDPOINTS.details(reportId), payload)
    return response.data
  },

  deleteReport: async (reportId: number): Promise<void> => {
    await api.delete(ANNUAL_REPORT_ENDPOINTS.byId(reportId))
  },

  getAnnexLines: async (reportId: number, schedule: AnnualReportScheduleKey): Promise<AnnexDataPagedResponse> => {
    const response = await api.get<AnnexDataPagedResponse>(ANNUAL_REPORT_ENDPOINTS.annex(reportId, schedule))
    return response.data
  },

  addAnnexLine: async (
    reportId: number,
    schedule: AnnualReportScheduleKey,
    payload: AnnexDataAddPayload,
  ): Promise<AnnexDataLine> => {
    const response = await api.post<AnnexDataLine>(ANNUAL_REPORT_ENDPOINTS.annex(reportId, schedule), payload)
    return response.data
  },

  updateAnnexLine: async (
    reportId: number,
    schedule: AnnualReportScheduleKey,
    lineId: number,
    payload: AnnexDataAddPayload,
  ): Promise<AnnexDataLine> => {
    const response = await api.patch<AnnexDataLine>(ANNUAL_REPORT_ENDPOINTS.annexLine(reportId, schedule, lineId), payload)
    return response.data
  },

  deleteAnnexLine: async (reportId: number, schedule: AnnualReportScheduleKey, lineId: number): Promise<void> => {
    await api.delete(ANNUAL_REPORT_ENDPOINTS.annexLine(reportId, schedule, lineId))
  },

  taxPreview: async (payload: TaxPreviewParams): Promise<{ net_profit: string; estimated_tax: string; balance: string }> => {
    const response = await api.post<{ net_profit: string; estimated_tax: string; balance: string }>(
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
