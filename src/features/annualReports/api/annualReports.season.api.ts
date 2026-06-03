import { api } from '@/api/client'
import { toQueryParams } from '@/api/queryParams'
import { ANNUAL_REPORT_ENDPOINTS } from './endpoints'
import type { AnnualReportListResponse, AnnualReportSummary, DefaultTaxYearResponse, SeasonSummary } from './contracts'

export const annualReportSeasonApi = {
  getActiveSeasonSummary: async (): Promise<SeasonSummary> => {
    const response = await api.get<SeasonSummary>(ANNUAL_REPORT_ENDPOINTS.activeTaxYearSummary)
    return response.data
  },

  getDefaultTaxYear: async (): Promise<DefaultTaxYearResponse> => {
    const response = await api.get<DefaultTaxYearResponse>(ANNUAL_REPORT_ENDPOINTS.defaultTaxYear)
    return response.data
  },

  getSeasonSummary: async (taxYear: number): Promise<SeasonSummary> => {
    const response = await api.get<SeasonSummary>(ANNUAL_REPORT_ENDPOINTS.taxYearSummary(taxYear))
    return response.data
  },

  listActiveSeasonReports: async (params: {
    page?: number
    page_size?: number
    client_record_id?: number
    status?: string
  }): Promise<AnnualReportListResponse> => {
    const response = await api.get<AnnualReportListResponse>(ANNUAL_REPORT_ENDPOINTS.activeTaxYearReports, {
      params: toQueryParams(params),
    })
    return response.data
  },

  listSeasonReports: async (
    taxYear: number,
    params: { page?: number; page_size?: number; client_record_id?: number; status?: string },
  ): Promise<AnnualReportListResponse> => {
    const response = await api.get<AnnualReportListResponse>(ANNUAL_REPORT_ENDPOINTS.taxYearReports(taxYear), {
      params: toQueryParams(params),
    })
    return response.data
  },

  getOverdue: async (taxYear?: number): Promise<AnnualReportSummary[]> => {
    const response = await api.get<AnnualReportListResponse>(ANNUAL_REPORT_ENDPOINTS.overdue, {
      params: toQueryParams({ tax_year: taxYear }),
    })
    return response.data.items
  },
}
