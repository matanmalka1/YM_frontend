import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { dashboardApi, dashboardQK } from '../api'
import type { DashboardOverviewResponse } from '../api'
import { getErrorMessage, getHttpStatus } from '../../../utils/utils'
import { useRole } from '../../../hooks/useRole'
import type { StatItem } from '../components/DashboardStatsGrid'
import { DASHBOARD_COPY } from '../dashboardConstants'
import { buildDashboardStats } from '../dashboardStats'

type DashboardState = {
  status: 'idle' | 'loading' | 'ok' | 'error'
  message: string
  data: DashboardOverviewResponse | null
}

export const useDashboardPage = () => {
  const { role, isAdvisor } = useRole()
  const hasRole = Boolean(role)

  const dashboardQuery = useQuery<DashboardOverviewResponse>({
    enabled: hasRole,
    queryKey: dashboardQK.overview,
    queryFn: dashboardApi.getOverview,
    staleTime: QUERY_STALE_TIME.short,
  })

  const denied = getHttpStatus(dashboardQuery.error) === 403

  const dashboard = useMemo<DashboardState>(() => {
    if (!hasRole) {
      return { status: 'error', message: DASHBOARD_COPY.roleMissing, data: null }
    }
    if (dashboardQuery.isPending) {
      return { status: 'loading', message: DASHBOARD_COPY.loadingDashboard, data: null }
    }
    if (dashboardQuery.error) {
      return {
        status: 'error',
        message: getErrorMessage(dashboardQuery.error, DASHBOARD_COPY.dashboardLoadError),
        data: null,
      }
    }
    if (dashboardQuery.data) {
      return { status: 'ok', message: DASHBOARD_COPY.dashboardLoaded, data: dashboardQuery.data }
    }
    return { status: 'idle', message: '', data: null }
  }, [dashboardQuery.data, dashboardQuery.error, dashboardQuery.isPending, hasRole])

  const attentionItems = dashboardQuery.data?.attention.items ?? []
  const isAdvisorView = dashboard.status === 'ok' && isAdvisor
  const emptyState = dashboard.data ? { is_empty: dashboard.data.is_empty } : undefined
  const vatStats = dashboard.data?.vat_stats
  const recentActivity = dashboard.data?.recent_activity ?? []

  const stats = useMemo<StatItem[]>(() => {
    if (dashboard.status !== 'ok' || !dashboard.data) return []
    return buildDashboardStats(dashboard.data, isAdvisor)
  }, [dashboard, isAdvisor])

  return {
    attentionItems,
    dashboard,
    denied,
    emptyState,
    isAdvisorView,
    stats,
    vatStats,
    recentActivity,
  }
}
