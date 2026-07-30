import { Download, Trash2, Save, Undo2 } from 'lucide-react'
import { useAnnualReportDetailPage } from '../../hooks/useAnnualReportDetailPage'
import { ConfirmDialog } from '../../../../components/ui/overlays/ConfirmDialog'
import { StatusTransitionPanel } from '../statusTransition/StatusTransitionPanelRoot'
import { AnnualReportSectionContent } from './AnnualReportSectionContent'
import { PageHeader, type Breadcrumb } from '../../../../components/layout/PageHeader'
import { Button } from '../../../../components/ui/primitives/Button'
import { SegmentedControl, SegmentedControlItem } from '../../../../components/ui/primitives/SegmentedControl'
import { PANEL_NAV_ITEMS } from '../../constants/panelConstants'
import { getClientLabel } from '../../utils/panelHelpers'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'
import { ANNUAL_REPORTS_ERROR_MESSAGES } from '../../errorMessages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface AnnualReportFullPanelProps {
  reportId: number
  backPath?: string
  /**
   * Leading breadcrumbs rendered before the report crumb. Defaults to the
   * standalone tax-reports list; the client tab passes its own client-scoped
   * chain (לקוחות › client › דוחות שנתיים) so the report stays nested in context.
   */
  leadingBreadcrumbs?: Breadcrumb[]
}

export const AnnualReportFullPanel = ({
  reportId,
  backPath = '/tax/reports',
  leadingBreadcrumbs,
}: AnnualReportFullPanelProps) => {
  const {
    report,
    isLoading,
    error,
    activeSection,
    setActiveSection,
    isDirty,
    setIsDirty,
    showDeleteConfirm,
    setShowDeleteConfirm,
    showWithdrawConfirm,
    setShowWithdrawConfirm,
    isExportingPdf,
    isAdvisor,
    submitRef,
    isUpdating,
    isDeleting,
    isWithdrawing,
    isTransitioning,
    completeSchedule,
    addSchedule,
    isCompletingSchedule,
    isAddingSchedule,
    updateDetail,
    handleSave,
    handleExportPdf,
    handleTransition,
    handleDeleteConfirm,
    handleWithdrawConfirm,
  } = useAnnualReportDetailPage(reportId, backPath)

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-sm text-gray-400">
        {ANNUAL_REPORTS_MESSAGES.fullPanel.loading}
      </div>
    )
  }

  // Delete and withdraw share their preconditions: advisor only, and never on a
  // submitted report. Both are enforced by the backend; gating here keeps a button
  // from existing that can only answer 403 or 400.
  const canMutateReport = isAdvisor && report?.status !== 'submitted'

  if (error || !report) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-sm text-negative-500">
        {error ?? ANNUAL_REPORTS_ERROR_MESSAGES.fullPanel.loadError}
      </div>
    )
  }

  return (
    <>
      <div>
        <PageHeader
          title={ANNUAL_REPORTS_MESSAGES.fullPanel.title(report.tax_year)}
          description={getClientLabel(report)}
          breadcrumbs={[
            ...(leadingBreadcrumbs ?? [{ label: ANNUAL_REPORTS_MESSAGES.fullPanel.breadcrumbList, to: backPath }]),
            { label: ANNUAL_REPORTS_MESSAGES.fullPanel.breadcrumbReport(report.tax_year) },
          ]}
          actions={
            <>
              {isAdvisor && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Download className="h-4 w-4" />}
                  onClick={handleExportPdf}
                  isLoading={isExportingPdf}
                >
                  {ANNUAL_REPORTS_MESSAGES.fullPanel.downloadDraft}
                </Button>
              )}
              {/* Both acts are advisor-only and neither touches a submitted report
                  (D-13), so both are gated on the same two facts the backend checks.
                  Which of the two is offered is the chain question: an amendment is
                  never deletable — removing it would leave the report it corrects
                  stamped as superseded, so the tax year would show no report at all
                  — and it is taken back instead, which also returns that report to
                  being the year's live one (D-12). A superseded amendment is not the
                  tip and cannot be withdrawn either. */}
              {canMutateReport && report.amends_id == null && (
                <Button variant="danger" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={() => setShowDeleteConfirm(true)}>
                  {ANNUAL_REPORTS_MESSAGES.fullPanel.deleteReport}
                </Button>
              )}
              {canMutateReport && report.amends_id != null && report.superseded_at == null && (
                <Button variant="outline" size="sm" icon={<Undo2 className="h-4 w-4" />} onClick={() => setShowWithdrawConfirm(true)}>
                  {ANNUAL_REPORTS_MESSAGES.fullPanel.withdrawAmendment}
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                icon={<Save className="h-4 w-4" />}
                onClick={handleSave}
                disabled={!isDirty || isUpdating}
              >
                {isUpdating ? GLOBAL_UI_MESSAGES.common.saving : GLOBAL_UI_MESSAGES.actions.save}
              </Button>
            </>
          }
        />

        {/* Navbar tabs */}
        <SegmentedControl variant="underline" className="mt-6" aria-label={ANNUAL_REPORTS_MESSAGES.panelNav.ariaLabel}>
          {PANEL_NAV_ITEMS.map(({ key, icon: Icon, label }) => (
            <SegmentedControlItem
              key={key}
              variant="underline"
              selected={activeSection === key}
              onClick={() => setActiveSection(key)}
              icon={<Icon size={15} />}
            >
              {label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>

        {/* Compact status bar — consistent across all tabs */}
        <div className="mt-3">
          <StatusTransitionPanel report={report} onTransition={handleTransition} isLoading={isTransitioning} />
        </div>

        {/* Section content — full width */}
        <div className="mt-6">
          <AnnualReportSectionContent
            reportId={reportId}
            activeSection={activeSection}
            report={report}
            updateDetail={updateDetail}
            completeSchedule={completeSchedule}
            addSchedule={addSchedule}
            isCompletingSchedule={isCompletingSchedule}
            isAddingSchedule={isAddingSchedule}
            setIsDirty={setIsDirty}
            submitRef={submitRef}
          />
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title={ANNUAL_REPORTS_MESSAGES.fullPanel.deleteModalTitle}
        message={ANNUAL_REPORTS_MESSAGES.fullPanel.deleteModalMessage}
        confirmLabel={GLOBAL_UI_MESSAGES.actions.delete}
        confirmVariant="danger"
        closeOnBackdrop={false}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmDialog
        open={showWithdrawConfirm}
        title={ANNUAL_REPORTS_MESSAGES.fullPanel.withdrawModalTitle}
        message={ANNUAL_REPORTS_MESSAGES.fullPanel.withdrawModalMessage}
        confirmLabel={ANNUAL_REPORTS_MESSAGES.fullPanel.withdrawAmendment}
        closeOnBackdrop={false}
        isLoading={isWithdrawing}
        onConfirm={handleWithdrawConfirm}
        onCancel={() => setShowWithdrawConfirm(false)}
      />
    </>
  )
}

AnnualReportFullPanel.displayName = 'AnnualReportFullPanel'
