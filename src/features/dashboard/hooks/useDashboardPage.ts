import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { dashboardApi, dashboardQK } from '../api'
import type { DashboardOverviewResponse } from '../api'
import { getErrorMessage, getHttpStatus } from '../../../utils/utils'
import type { ActionCommand } from '../../../lib/actions/types'
import { useRole } from '../../../hooks/useRole'
import { useActionRunner } from '@/features/actions'
import type { StatItem } from '../components/DashboardStatsGrid'
import { DASHBOARD_COPY } from '../dashboardConstants'
import { buildDashboardStats } from '../dashboardStats'

type DashboardState = {
  status: 'idle' | 'loading' | 'ok' | 'error'
  message: string
  data: DashboardOverviewResponse | null
}

export const useDashboardPage = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { role, isAdvisor } = useRole()
  const [actionDenied, setActionDenied] = useState(false)
  const hasRole = Boolean(role)

  const dashboardQuery = useQuery<DashboardOverviewResponse>({
    enabled: hasRole,
    queryKey: dashboardQK.overview,
    queryFn: dashboardApi.getOverview,
    staleTime: QUERY_STALE_TIME.short,
  })

  const {
    activeActionKey: activeQuickAction,
    handleAction: handleQuickActionBase,
    pendingAction: pendingQuickAction,
    confirmPendingAction: confirmPendingActionBase,
    cancelPendingAction: cancelPendingActionBase,
  } = useActionRunner({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dashboardQK.all }),
    errorFallback: 'שגיאה בביצוע פעולה מהירה',
    onError: (err) => {
      if (getHttpStatus(err) === 403) {
        setActionDenied(true)
      }
    },
  })

  const denied = useMemo(() => {
    const queryDenied = getHttpStatus(dashboardQuery.error) === 403
    return queryDenied || actionDenied
  }, [actionDenied, dashboardQuery.error])

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
  const quickActions = isAdvisorView ? [] : undefined
  const emptyState = dashboard.data ? { is_empty: dashboard.data.is_empty } : undefined
  const vatStats = dashboard.data?.vat_stats
  const recentActivity = dashboard.data?.recent_activity ?? []

  const stats = useMemo<StatItem[]>(() => {
    if (dashboard.status !== 'ok' || !dashboard.data) return []
    return buildDashboardStats(dashboard.data, isAdvisor)
  }, [dashboard, isAdvisor])

  const handleQuickAction = useCallback(
    (action: ActionCommand) => {
      setActionDenied(false)
      if (action.method === 'get') {
        navigate(action.endpoint)
        return
      }
      handleQuickActionBase(action)
    },
    [handleQuickActionBase, navigate],
  )

  const confirmPendingAction = useCallback(async () => {
    setActionDenied(false)
    await confirmPendingActionBase()
  }, [confirmPendingActionBase])

  const cancelPendingAction = useCallback(() => {
    setActionDenied(false)
    cancelPendingActionBase()
  }, [cancelPendingActionBase])

  return {
    activeQuickAction,
    attentionItems,
    dashboard,
    denied,
    handleQuickAction,
    confirmPendingAction,
    pendingQuickAction,
    quickActions,
    emptyState,
    cancelPendingAction,
    isAdvisorView,
    stats,
    vatStats,
    recentActivity,
  }
}
