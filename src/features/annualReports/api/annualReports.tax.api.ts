import { api } from '@/api/client'
import { ANNUAL_REPORT_ENDPOINTS } from './endpoints'
import type {
  ReadinessCheckResponse,
  TaxCalculationResult,
  TaxCalculationSaveRequest,
  TaxCalculationSaveResponse,
} from './contracts'

export const annualReportTaxApi = {
  getTaxCalculation: async (reportId: number): Promise<TaxCalculationResult> => {
    const response = await api.get<TaxCalculationResult>(ANNUAL_REPORT_ENDPOINTS.taxCalculation(reportId))
    return response.data
  },

  getReadiness: async (reportId: number): Promise<ReadinessCheckResponse> => {
    const response = await api.get<ReadinessCheckResponse>(ANNUAL_REPORT_ENDPOINTS.readiness(reportId))
    return response.data
  },

  saveTaxCalculation: async (reportId: number, payload: TaxCalculationSaveRequest): Promise<TaxCalculationSaveResponse> => {
    const response = await api.post<TaxCalculationSaveResponse>(ANNUAL_REPORT_ENDPOINTS.saveTaxCalculation(reportId), payload)
    return response.data
  },
}
