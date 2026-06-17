import { useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { getHttpStatus } from '@/utils/utils'
import { useRole } from '@/hooks/useRole'
import { dashboardApi, dashboardQK } from '../api'
import type { DashboardOverviewResponse } from '../api'
import { deriveDashboardState } from '../dashboard.utils'
import { buildDashboardStats } from '../dashboardStats'

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
  const dashboard = deriveDashboardState(hasRole, dashboardQuery)

  const attentionItems = dashboard.data?.attention.items ?? []
  const isAdvisorView = dashboard.status === 'ok' && isAdvisor
  const emptyState = dashboard.data ? { is_empty: dashboard.data.is_empty } : undefined
  const vatStats = dashboard.data?.vat_stats
  const recentActivity = dashboard.data?.recent_activity ?? []
  const stats = dashboard.status === 'ok' && dashboard.data ? buildDashboardStats(dashboard.data, isAdvisor) : []

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
