import { api } from '@/api/client'
import type { TaxSubmissionWidgetResponse } from './contracts'

const TAX_SUBMISSIONS_ENDPOINT = '/dashboard/tax-submissions'

export const taxDashboardApi = {
  getTaxSubmissionsWidget: async (taxYear?: number): Promise<TaxSubmissionWidgetResponse> => {
    const response = await api.get<TaxSubmissionWidgetResponse>(TAX_SUBMISSIONS_ENDPOINT, {
      params: taxYear ? { tax_year: taxYear } : undefined,
    })
    return response.data
  },
}
