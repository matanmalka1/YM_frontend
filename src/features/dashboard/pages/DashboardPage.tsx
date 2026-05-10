import { useMemo } from 'react'
import { Alert } from '@/components/ui/overlays/Alert'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { SignatureRequestsDashboardPanel } from '@/features/signatureRequests'
import {
  AttentionBoard,
  DashboardOnboardingEmptyState,
  DashboardStatsGrid,
  SeasonSummaryWidget,
  useDashboardPage,
} from '@/features/dashboard'
import { DASHBOARD_COPY, DASHBOARD_LOADING_CARD_COUNT } from '../dashboardConstants'
import { DashboardSurface } from '../components/DashboardPrimitives'
import { RecentActivityPanel } from '../components/RecentActivityPanel'
import { TaxInsightsRow } from '../components/TaxInsightsRow'
import { UpcomingDeadlinesPanel } from '../components/UpcomingDeadlinesPanel'
import {
  buildOpenChargeSection,
  buildQuickActionSections,
  type PanelSection,
} from '../attentionBoardSections'

const StatsSkeleton = () => (
  <div className="grid animate-pulse grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
    {Array.from({ length: DASHBOARD_LOADING_CARD_COUNT }, (_, i) => (
      <div key={i} className="h-32 rounded-xl bg-gray-100" />
    ))}
  </div>
)

export const DashboardPage: React.FC = () => {
  const {
    activeQuickAction,
    attentionItems,
    dashboard,
    denied,
    handleQuickAction,
    isAdvisorView,
    confirmPendingAction,
    cancelPendingAction,
    pendingQuickAction,
    quickActions,
    emptyState,
    attentionEmptyChecks,
    stats,
    vatStats,
    recentActivity,
  } = useDashboardPage()

  const attentionSections = useMemo<PanelSection[]>(() => {
    const openChargeSection = buildOpenChargeSection(attentionItems)
    if (!isAdvisorView) return [openChargeSection]

    return [
      openChargeSection,
      ...buildQuickActionSections(quickActions ?? []),
    ]
  }, [attentionItems, quickActions, isAdvisorView])

  return (
    <DashboardSurface>
      <div className="px-1">
        <h1 className="text-2xl font-bold text-gray-950">{DASHBOARD_COPY.pageTitle}</h1>
        <p className="mt-1 text-sm text-gray-500">{DASHBOARD_COPY.pageSubtitle}</p>
      </div>

      {denied && <Alert variant="warning" message={DASHBOARD_COPY.permissionDenied} />}
      {dashboard.status === 'error' && !denied && <Alert variant="error" message={dashboard.message} />}

      {dashboard.status === 'loading' ? (
        <StatsSkeleton />
      ) : emptyState?.is_empty ? (
        <DashboardOnboardingEmptyState />
      ) : dashboard.status === 'ok' ? (
        <DashboardStatsGrid stats={stats} />
      ) : null}

      {isAdvisorView && !emptyState?.is_empty && <SeasonSummaryWidget />}

      {isAdvisorView && !emptyState?.is_empty ? (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="grid gap-5 md:grid-cols-2 lg:col-start-2 lg:row-start-1 lg:grid-cols-1">
            <UpcomingDeadlinesPanel />
            <RecentActivityPanel items={recentActivity} />
          </div>
          <div className="space-y-5 lg:col-start-1 lg:row-start-1">
            {dashboard.status === 'loading' ? (
              <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
            ) : (
              <AttentionBoard
                sections={attentionSections}
                emptyChecks={attentionEmptyChecks}
                activeActionKey={activeQuickAction}
                onAction={handleQuickAction}
              />
            )}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {vatStats && <TaxInsightsRow vatStats={vatStats} />}
              <SignatureRequestsDashboardPanel compact />
            </div>
          </div>
        </div>
      ) : dashboard.status === 'loading' ? (
        <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
      ) : (
        <AttentionBoard sections={attentionSections} emptyChecks={attentionEmptyChecks} />
      )}

      {vatStats && !emptyState?.is_empty && !isAdvisorView && <TaxInsightsRow vatStats={vatStats} />}

      <ConfirmDialog
        open={Boolean(pendingQuickAction)}
        title={pendingQuickAction?.confirm?.title || DASHBOARD_COPY.confirmTitle}
        message={pendingQuickAction?.confirm?.message || DASHBOARD_COPY.confirmMessage}
        confirmLabel={pendingQuickAction?.confirm?.confirmLabel || DASHBOARD_COPY.confirmLabel}
        cancelLabel={pendingQuickAction?.confirm?.cancelLabel || DASHBOARD_COPY.cancelLabel}
        isLoading={activeQuickAction === pendingQuickAction?.uiKey}
        onConfirm={confirmPendingAction}
        onCancel={cancelPendingAction}
      />
    </DashboardSurface>
  )
}
