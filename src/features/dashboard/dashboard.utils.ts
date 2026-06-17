import { getErrorMessage } from '@/utils/utils'
import type { DashboardOverviewResponse } from './api'
import { DASHBOARD_COPY } from './dashboardConstants'

export const dueDateLabel = (daysDelta: number): string => {
  if (daysDelta < 0) return `באיחור ${Math.abs(daysDelta)} ימים`
  if (daysDelta === 0) return 'היום'
  return `עוד ${daysDelta} ימים`
}

export type DashboardState = {
  status: 'idle' | 'loading' | 'ok' | 'error'
  message: string
  data: DashboardOverviewResponse | null
}

type DashboardQueryState = {
  isPending: boolean
  error: unknown
  data: DashboardOverviewResponse | undefined
}

/** Maps the role guard + query lifecycle into the view state the dashboard page renders from. */
export const deriveDashboardState = (hasRole: boolean, query: DashboardQueryState): DashboardState => {
  if (!hasRole) return { status: 'error', message: DASHBOARD_COPY.roleMissing, data: null }
  if (query.isPending) return { status: 'loading', message: DASHBOARD_COPY.loadingDashboard, data: null }
  if (query.error) {
    return { status: 'error', message: getErrorMessage(query.error, DASHBOARD_COPY.dashboardLoadError), data: null }
  }
  if (query.data) return { status: 'ok', message: DASHBOARD_COPY.dashboardLoaded, data: query.data }
  return { status: 'idle', message: '', data: null }
}
