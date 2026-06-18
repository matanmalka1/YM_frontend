import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/overlays/Alert'
import { Modal } from '@/components/ui/overlays/Modal'
import { Button } from '@/components/ui/primitives/Button'
import { ClientPickerField } from '@/components/shared/client/ClientPickerField'
import { CreateAdvancePaymentModal } from '@/features/advancedPayments'
import { ChargesCreateModal } from '@/features/charges'
import { CreateClientModal, DeletedClientDialog, type ClientRecordResponse } from '@/features/clients'
import { SignatureRequestsDashboardPanel } from '@/features/signatureRequests'
import { VatWorkItemsCreateModal } from '@/features/vatReports'
import { getOperationalTaxYear } from '@/constants/periodOptions.constants'
import { SkeletonBlock } from '@/components/ui/primitives/SkeletonBlock'
import {
  AttentionBoard,
  DashboardOnboardingEmptyState,
  DashboardStatsGrid,
  SeasonSummaryWidget,
  useDashboardPage,
} from '@/features/dashboard'
import { DASHBOARD_COPY } from '../dashboardConstants'
import { DashboardSurface } from '../components/DashboardLayout'
import { DashboardStatsSkeleton } from '../components/DashboardStatsSkeleton'
import { RecentActivityPanel } from '../components/RecentActivityPanel'
import { QuickActionsPanel } from '../components/QuickActionsPanel'
import { TaxInsightsRow } from '../components/TaxInsightsRow'
import { UpcomingDeadlinesPanel } from '../components/UpcomingDeadlinesPanel'
import { useDashboardCreateModals } from '../hooks/useDashboardCreateModals'

const AttentionSkeleton = () => <SkeletonBlock height="h-80" width="w-full" className="rounded-3xl" />

export const DashboardPage: React.FC = () => {
  const { attentionItems, dashboard, denied, isAdvisorView, emptyState, stats, vatStats, recentActivity } =
    useDashboardPage()

  const {
    activeCreateModal,
    setActiveCreateModal,
    deletedClientInfo,
    setDeletedClientInfo,
    closeCreateModal,
    chargeCreateMutation,
    vatCreateMutation,
    advancePaymentCreateMutation,
    clientCreateMutation,
    restoreClientMutation,
    submitChargeCreate,
    submitVatCreate,
    submitAdvancePaymentCreate,
    submitClientCreate,
    chargeCreateError,
    vatCreateError,
    advancePaymentClientId,
    advancePaymentClientPicker,
  } = useDashboardCreateModals()

  return (
    <DashboardSurface>
      <PageHeader title={DASHBOARD_COPY.pageTitle} description={DASHBOARD_COPY.pageSubtitle} />

      {denied && <Alert variant="warning" message={DASHBOARD_COPY.permissionDenied} />}
      {dashboard.status === 'error' && !denied && <Alert variant="error" message={dashboard.message} />}

      {dashboard.status === 'loading' ? (
        <DashboardStatsSkeleton />
      ) : emptyState?.is_empty ? (
        <DashboardOnboardingEmptyState />
      ) : dashboard.status === 'ok' ? (
        <DashboardStatsGrid stats={stats} />
      ) : null}

      {isAdvisorView && !emptyState?.is_empty && (
        <SeasonSummaryWidget sideContent={vatStats ? <TaxInsightsRow vatStats={vatStats} embedded /> : undefined} />
      )}

      {isAdvisorView && !emptyState?.is_empty ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <aside className="flex flex-col gap-5 lg:col-start-2 lg:row-start-1">
            <QuickActionsPanel onOpenModal={setActiveCreateModal} />
            <UpcomingDeadlinesPanel />
            <RecentActivityPanel items={recentActivity} className="flex-1" />
          </aside>
          <div className="space-y-5 lg:col-start-1 lg:row-start-1">
            {dashboard.status === 'loading' ? <AttentionSkeleton /> : <AttentionBoard items={attentionItems} />}
            <SignatureRequestsDashboardPanel />
          </div>
        </div>
      ) : dashboard.status === 'loading' ? (
        <AttentionSkeleton />
      ) : (
        <AttentionBoard items={attentionItems} />
      )}

      {vatStats && !emptyState?.is_empty && !isAdvisorView && <TaxInsightsRow vatStats={vatStats} />}

      <ChargesCreateModal
        open={activeCreateModal === 'charge'}
        createError={chargeCreateError}
        createLoading={chargeCreateMutation.isPending}
        onClose={closeCreateModal}
        onSubmit={submitChargeCreate}
      />
      <VatWorkItemsCreateModal
        open={activeCreateModal === 'vat'}
        createError={vatCreateError}
        createLoading={vatCreateMutation.isPending}
        onClose={closeCreateModal}
        onSubmit={submitVatCreate}
      />
      <Modal
        open={activeCreateModal === 'advancePayment' && advancePaymentClientId === null}
        title="מקדמה חדשה — בחר לקוח"
        className="min-h-[240px]"
        onClose={closeCreateModal}
        footer={
          <Button variant="outline" onClick={closeCreateModal}>
            ביטול
          </Button>
        }
      >
        <ClientPickerField
          selectedClient={advancePaymentClientPicker.selectedClient}
          clientQuery={advancePaymentClientPicker.clientQuery}
          onQueryChange={advancePaymentClientPicker.handleClientQueryChange}
          onSelect={advancePaymentClientPicker.handleSelectClient}
          onClear={advancePaymentClientPicker.handleClearClient}
        />
      </Modal>
      {activeCreateModal === 'advancePayment' && advancePaymentClientId !== null && (
        <CreateAdvancePaymentModal
          open={true}
          clientRecordId={advancePaymentClientId}
          year={getOperationalTaxYear()}
          isCreating={advancePaymentCreateMutation.isPending}
          onClose={closeCreateModal}
          onCreate={submitAdvancePaymentCreate}
        />
      )}
      <CreateClientModal
        open={activeCreateModal === 'client' && deletedClientInfo === null}
        onClose={closeCreateModal}
        onSubmit={submitClientCreate}
        onRestoreDeletedClient={async (clientId): Promise<ClientRecordResponse> => {
          const restored = await restoreClientMutation.mutateAsync(clientId)
          return restored
        }}
        isAdvisor={isAdvisorView}
        isLoading={clientCreateMutation.isPending}
        restoreLoading={restoreClientMutation.isPending}
      />
      <DeletedClientDialog
        open={deletedClientInfo !== null}
        deletedClient={deletedClientInfo}
        isAdvisor={isAdvisorView}
        onRestore={() => {
          if (deletedClientInfo) restoreClientMutation.mutate(deletedClientInfo.id)
        }}
        onForceCreate={() => setDeletedClientInfo(null)}
        onDismiss={() => setDeletedClientInfo(null)}
        restoreLoading={restoreClientMutation.isPending}
        forceCreateLoading={false}
      />
    </DashboardSurface>
  )
}
