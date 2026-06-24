import { Download, Trash2, Save } from 'lucide-react'
import { useAnnualReportDetailPage } from '../../hooks/useAnnualReportDetailPage'
import { ConfirmDialog } from '../../../../components/ui/overlays/ConfirmDialog'
import { AnnualReportSidebarStatus } from './AnnualReportSidebarStatus'
import { AnnualReportSectionContent } from './AnnualReportSectionContent'
import { PageHeader } from '../../../../components/layout/PageHeader'
import { Button } from '../../../../components/ui/primitives/Button'
import { SegmentedControl, SegmentedControlItem } from '../../../../components/ui/primitives/SegmentedControl'
import { PANEL_NAV_ITEMS } from '../../constants/panelConstants'
import { getClientLabel } from '../../utils/panelHelpers'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'
import { ANNUAL_REPORTS_ERROR_MESSAGES } from '../../errorMessages'

interface AnnualReportFullPanelProps {
  reportId: number
  backPath?: string
}

export const AnnualReportFullPanel = ({ reportId, backPath = '/tax/reports' }: AnnualReportFullPanelProps) => {
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
    isExportingPdf,
    isAdvisor,
    submitRef,
    isUpdating,
    isDeleting,
    completeSchedule,
    addSchedule,
    isCompletingSchedule,
    isAddingSchedule,
    updateDetail,
    handleSave,
    handleExportPdf,
    handleTransition,
    handleDeleteConfirm,
  } = useAnnualReportDetailPage(reportId, backPath)

  if (isLoading) {
    return <div className="flex flex-1 items-center justify-center py-24 text-sm text-gray-400">{ANNUAL_REPORTS_MESSAGES.fullPanel.loading}</div>
  }

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
            { label: ANNUAL_REPORTS_MESSAGES.fullPanel.breadcrumbList, to: backPath },
            { label: ANNUAL_REPORTS_MESSAGES.fullPanel.breadcrumbReport(report.tax_year), to: '#' },
          ]}
          actions={
            <>
              {isAdvisor && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Download className="h-4 w-4" />}
                  onClick={handleExportPdf}
                  isLoading={isExportingPdf}
                >
                  {ANNUAL_REPORTS_MESSAGES.fullPanel.downloadDraft}
                </Button>
              )}
              <Button
                variant="ghost"
                icon={<Trash2 size={14} />}
                onClick={() => setShowDeleteConfirm(true)}
                className="border-negative-300 text-negative-600 hover:bg-negative-50"
              >
                {ANNUAL_REPORTS_MESSAGES.fullPanel.deleteReport}
              </Button>
              <Button variant="ghost" icon={<Save size={14} />} onClick={handleSave} disabled={!isDirty || isUpdating}>
                {isUpdating ? ANNUAL_REPORTS_MESSAGES.fullPanel.saving : ANNUAL_REPORTS_MESSAGES.fullPanel.save}
              </Button>
            </>
          }
        />

        {/* Navbar tabs */}
        <SegmentedControl variant="boxed" className="mt-6" aria-label={ANNUAL_REPORTS_MESSAGES.panelNav.ariaLabel}>
          {PANEL_NAV_ITEMS.map(({ key, icon: Icon, label }) => (
            <SegmentedControlItem
              key={key}
              variant="boxed"
              selected={activeSection === key}
              onClick={() => setActiveSection(key)}
              icon={<Icon size={15} />}
            >
              {label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>

        {/* Status strip */}
        <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50">
          <AnnualReportSidebarStatus
            report={report}
            detail={null}
            availableActions={[]}
            onTransition={handleTransition}
          />
        </div>

        {/* Section content */}
        <div className="mt-6">
          <AnnualReportSectionContent
            reportId={reportId}
            activeSection={activeSection}
            report={report}
            updateDetail={updateDetail}
            isUpdating={isUpdating}
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
        confirmLabel={ANNUAL_REPORTS_MESSAGES.fullPanel.deleteConfirm}
        confirmVariant="danger"
        closeOnBackdrop={false}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  )
}

AnnualReportFullPanel.displayName = 'AnnualReportFullPanel'
