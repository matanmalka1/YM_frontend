import { api } from '@/api/client'
import { DASHBOARD_ENDPOINTS } from './endpoints'
import type { DashboardOverviewResponse } from './contracts'

export const dashboardApi = {
  getOverview: async (): Promise<DashboardOverviewResponse> => {
    const response = await api.get<DashboardOverviewResponse>(DASHBOARD_ENDPOINTS.dashboardOverview)
    return response.data
  },
}
