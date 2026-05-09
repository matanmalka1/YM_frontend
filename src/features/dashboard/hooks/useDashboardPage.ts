import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { dashboardApi, dashboardQK } from '../api'
import type { DashboardOverviewResponse, DashboardSummaryResponse } from '../api'
import { getErrorMessage, getHttpStatus } from '../../../utils/utils'
import type { ActionCommand } from '../../../lib/actions/types'
import { useRole } from '../../../hooks/useRole'
import { useActionRunner } from '@/features/actions'
import { useUnifiedTasks } from '@/features/tasks'
import type { StatItem } from '../components/DashboardStatsGrid'
import { DASHBOARD_COPY } from '../dashboardConstants'
import { buildDashboardStats } from '../dashboardStats'

type DashboardData =
  | (DashboardOverviewResponse & { role_view: 'advisor' })
  | (DashboardSummaryResponse & { role_view: 'secretary' })
type DashboardState = {
  status: 'idle' | 'loading' | 'ok' | 'error'
  message: string
  data: DashboardData | null
}

const isOverviewData = (
  data: DashboardData | DashboardOverviewResponse | DashboardSummaryResponse | null | undefined,
): data is DashboardOverviewResponse => Boolean(data && 'quick_actions' in data)

const isSummaryData = (
  data: DashboardData | DashboardOverviewResponse | DashboardSummaryResponse | null | undefined,
): data is DashboardSummaryResponse => Boolean(data && !('quick_actions' in data))

export const useDashboardPage = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { role, isAdvisor, isSecretary } = useRole()
  const [actionDenied, setActionDenied] = useState(false)
  const hasRole = Boolean(role)
  const dashboardQuery = useQuery<DashboardOverviewResponse | DashboardSummaryResponse>({
    enabled: hasRole,
    queryKey: isAdvisor ? dashboardQK.overview : dashboardQK.summary,
    queryFn: isAdvisor ? dashboardApi.getOverview : dashboardApi.getSummary,
  })
  const unifiedTasksQuery = useUnifiedTasks(
    {
      exclude_source_types: ['vat_filing', 'annual_report', 'unpaid_charge'],
      include_reminders: false,
    },
    hasRole && isAdvisor,
  )

  const {
    activeActionKey: activeQuickAction,
    handleAction: handleQuickActionBase,
    pendingAction: pendingQuickAction,
    confirmPendingAction: confirmPendingActionBase,
    cancelPendingAction: cancelPendingActionBase,
  } = useActionRunner({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dashboardQK.all }),
    errorFallback: 'שגיאה בביצוע פעולה מהירה',
    canonicalAction: true,
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
      return {
        status: 'error',
        message: DASHBOARD_COPY.roleMissing,
        data: null,
      }
    }

    if (dashboardQuery.isPending) {
      return {
        status: 'loading',
        message: DASHBOARD_COPY.loadingDashboard,
        data: null,
      }
    }

    if (dashboardQuery.error) {
      return {
        status: 'error',
        message: getErrorMessage(dashboardQuery.error, DASHBOARD_COPY.dashboardLoadError),
        data: null,
      }
    }

    if (isAdvisor && isOverviewData(dashboardQuery.data)) {
      return {
        status: 'ok',
        message: DASHBOARD_COPY.dashboardLoaded,
        data: { role_view: 'advisor', ...dashboardQuery.data },
      }
    }

    if (isSecretary && isSummaryData(dashboardQuery.data)) {
      return {
        status: 'ok',
        message: DASHBOARD_COPY.dashboardLoaded,
        data: { role_view: 'secretary', ...dashboardQuery.data },
      }
    }

    return { status: 'idle', message: '', data: null }
  }, [dashboardQuery.data, dashboardQuery.error, dashboardQuery.isPending, hasRole, isAdvisor, isSecretary])

  const attentionItems = dashboardQuery.data?.attention.items ?? []

  const stats = useMemo<StatItem[]>(() => {
    if (dashboard.status !== 'ok' || !dashboard.data) return []
    return buildDashboardStats(dashboard.data)
  }, [dashboard])
  const isAdvisorView = dashboard.status === 'ok' && dashboard.data?.role_view === 'advisor'
  const quickActions = isOverviewData(dashboard.data) ? dashboard.data.quick_actions : undefined
  const advisorToday = isOverviewData(dashboard.data) ? dashboard.data.advisor_today : undefined
  const emptyState = dashboard.data ? { is_empty: dashboard.data.total_clients === 0 } : undefined
  const attentionEmptyChecks = isOverviewData(dashboard.data) ? dashboard.data.attention_empty_checks : []

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

  const vatStats = dashboardQuery.data?.vat_stats

  return {
    activeQuickAction,
    attentionItems,
    dashboard,
    denied,
    handleQuickAction,
    confirmPendingAction,
    pendingQuickAction,
    quickActions,
    advisorToday,
    unifiedItems: unifiedTasksQuery.data ?? [],
    emptyState,
    attentionEmptyChecks,
    cancelPendingAction,
    isAdvisorView,
    stats,
    vatStats,
  }
}
