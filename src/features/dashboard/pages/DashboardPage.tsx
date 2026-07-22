import { ClipboardList, Wallet } from 'lucide-react'
import { Alert } from '@/components/ui/overlays/Alert'
import { Modal } from '@/components/ui/overlays/Modal'
import { Button } from '@/components/ui/primitives/Button'
import { ClientSearchInput } from '@/features/clients/public'
import { CreateAdvancePaymentModal } from '@/features/advancedPayments'
import { ChargesCreateModal } from '@/features/charges'
import { CreateClientModal, DeletedClientDialog } from '@/features/clients'
import { SignatureRequestsDashboardPanel } from '@/features/signatureRequests'
import { VatWorkItemsCreateModal } from '@/features/vatReports'
import { getOperationalTaxYear } from '@/constants/periodOptions.constants'
import { SkeletonBlock } from '@/components/ui/primitives/SkeletonBlock'
import { AttentionBoard } from '../components/panels/AttentionBoard'
import { DashboardOnboardingEmptyState } from '../components/shared/DashboardOnboardingEmptyState'
import { useDashboardPage } from '../hooks/useDashboardPage'
import { DASHBOARD_COPY, DASHBOARD_HREFS, VAT_STAT_LABELS } from '../constants'
import { DashboardSurface } from '../components/shared/DashboardLayout'
import { DashboardStatsSkeleton } from '../components/kpi/DashboardStatsSkeleton'
import { RecentActivityPanel } from '../components/panels/RecentActivityPanel'
import { QuickActionsPanel } from '../components/panels/QuickActionsPanel'
import { VatStatCard } from '../components/kpi/VatStatCard'
import { OpenChargesCard } from '../components/panels/OpenChargesCard'
import { SeasonInsightsCarousel } from '../components/panels/SeasonInsightsCarousel'
import { UpcomingDeadlinesPanel } from '../components/panels/UpcomingDeadlinesPanel'
import { DASHBOARD_MESSAGES } from '../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

const AttentionSkeleton = () => <SkeletonBlock height="h-80" width="w-full" className="rounded-3xl" />

export const DashboardPage: React.FC = () => {
  const { attentionItems, dashboard, denied, isAdvisorView, emptyState, vatStats, recentActivity, modals } = useDashboardPage()

  return (
    <DashboardSurface>
      {denied && <Alert variant="warning" message={DASHBOARD_COPY.permissionDenied} />}
      {dashboard.status === 'error' && !denied && <Alert variant="error" message={dashboard.message} />}

      {dashboard.status === 'error' && !denied ? null : dashboard.status === 'loading' ? (
        <DashboardStatsSkeleton />
      ) : emptyState?.is_empty ? (
        <DashboardOnboardingEmptyState />
      ) : dashboard.status === 'ok' && vatStats ? (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <VatStatCard
            title={VAT_STAT_LABELS.vatMonthly}
            unit={DASHBOARD_MESSAGES.stats.pendingReports}
            icon={ClipboardList}
            stat={vatStats.monthly}
            href={DASHBOARD_HREFS.vat(vatStats.monthly.period, 'monthly')}
          />
          <VatStatCard
            title={VAT_STAT_LABELS.vatBimonthly}
            unit={DASHBOARD_MESSAGES.stats.pendingReports}
            icon={ClipboardList}
            stat={vatStats.bimonthly}
            href={DASHBOARD_HREFS.vat(vatStats.bimonthly.period, 'bimonthly')}
          />
          <VatStatCard
            title={VAT_STAT_LABELS.advanceMonthly}
            unit={DASHBOARD_MESSAGES.stats.advancesDue}
            icon={Wallet}
            stat={vatStats.advance_payments.monthly}
            href={DASHBOARD_HREFS.advancePayments(vatStats.advance_payments.monthly.period, 1)}
          />
          <VatStatCard
            title={VAT_STAT_LABELS.advanceBimonthly}
            unit={DASHBOARD_MESSAGES.stats.advancesDue}
            icon={Wallet}
            stat={vatStats.advance_payments.bimonthly}
            href={DASHBOARD_HREFS.advancePayments(vatStats.advance_payments.bimonthly.period, 2)}
          />
        </section>
      ) : null}

      {isAdvisorView && !emptyState?.is_empty && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {/* Left column: attention + recent activity */}
          <div className="flex flex-col gap-5 min-w-0">
            {dashboard.status === 'loading' ? (
              <AttentionSkeleton />
            ) : (
              <AttentionBoard items={attentionItems} total={dashboard.data?.attention.total} />
            )}
            <SignatureRequestsDashboardPanel />
            <RecentActivityPanel items={recentActivity} className="flex-1" />
          </div>

          {/* Right column: charges + insights + season + quick actions */}
          <div className="flex flex-col gap-5 min-w-0">
            {dashboard.data && (
              <OpenChargesCard count={dashboard.data.open_charges_count} amountIls={dashboard.data.open_charges_amount_ils} />
            )}
            {vatStats && <SeasonInsightsCarousel vatStats={vatStats} />}
            <QuickActionsPanel onOpenModal={modals.openCreate} />
            <UpcomingDeadlinesPanel />
          </div>
        </div>
      )}

      {!isAdvisorView &&
        !emptyState?.is_empty &&
        (dashboard.status === 'loading' ? <AttentionSkeleton /> : <AttentionBoard items={attentionItems} />)}

      <ChargesCreateModal {...modals.chargeProps} />
      <VatWorkItemsCreateModal {...modals.vatProps} />
      <Modal
        open={modals.advancePaymentClientPickerProps.open}
        title={DASHBOARD_MESSAGES.modals.chooseAdvancePaymentClient}
        className="min-h-[240px]"
        onClose={modals.advancePaymentClientPickerProps.onClose}
        footer={
          <Button variant="outline" onClick={modals.advancePaymentClientPickerProps.onClose}>
            {GLOBAL_UI_MESSAGES.actions.cancel}
          </Button>
        }
      >
        <ClientSearchInput
          selectedClient={modals.advancePaymentClientPickerProps.picker.selectedClient}
          value={modals.advancePaymentClientPickerProps.picker.clientQuery}
          onChange={modals.advancePaymentClientPickerProps.picker.handleClientQueryChange}
          onSelect={modals.advancePaymentClientPickerProps.picker.handleSelectClient}
          onClear={modals.advancePaymentClientPickerProps.picker.handleClearClient}
        />
      </Modal>
      {modals.advancePaymentProps && <CreateAdvancePaymentModal {...modals.advancePaymentProps} year={getOperationalTaxYear()} />}
      <CreateClientModal {...modals.clientProps} />
      <DeletedClientDialog {...modals.deletedClientProps} />
    </DashboardSurface>
  )
}
