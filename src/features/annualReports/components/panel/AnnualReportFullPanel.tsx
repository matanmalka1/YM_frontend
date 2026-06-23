import { cn } from '@/utils/utils'
import { Download, Trash2, Save } from 'lucide-react'
import { useAnnualReportDetailPage } from '../../hooks/useAnnualReportDetailPage'
import { ConfirmDialog } from '../../../../components/ui/overlays/ConfirmDialog'
import { AnnualReportSidebarStatus } from './AnnualReportSidebarStatus'
import { AnnualReportSectionContent } from './AnnualReportSectionContent'
import { PageHeader } from '../../../../components/layout/PageHeader'
import { Button } from '../../../../components/ui/primitives/Button'
import { PANEL_NAV_ITEMS, PANEL_TAB_VARIANTS } from '../../constants/panelConstants'
import { getClientLabel } from '../../utils/panelHelpers'

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
    return <div className="flex flex-1 items-center justify-center py-24 text-sm text-gray-400">טוען דוח...</div>
  }

  if (error || !report) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-sm text-negative-500">
        {error ?? 'שגיאה בטעינת הדוח'}
      </div>
    )
  }

  return (
    <>
      <div>
        <PageHeader
          title={`דוח שנתי ${report.tax_year}`}
          description={getClientLabel(report)}
          breadcrumbs={[
            { label: 'דוחות שנתיים', to: backPath },
            { label: `דוח ${report.tax_year}`, to: '#' },
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
                  הורד טיוטה
                </Button>
              )}
              <Button
                variant="ghost"
                icon={<Trash2 size={14} />}
                onClick={() => setShowDeleteConfirm(true)}
                className="border-negative-300 text-negative-600 hover:bg-negative-50"
              >
                מחק דוח
              </Button>
              <Button
                variant="ghost"
                icon={<Save size={14} />}
                onClick={handleSave}
                disabled={!isDirty || isUpdating}
              >
                {isUpdating ? 'שומר...' : 'שמור'}
              </Button>
            </>
          }
        />

        {/* Navbar tabs */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex" role="tablist">
            {PANEL_NAV_ITEMS.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeSection === key}
                onClick={() => setActiveSection(key)}
                className={cn(
                  'flex items-center gap-2 px-5 py-3 text-sm whitespace-nowrap transition-colors first:rounded-r-xl last:rounded-l-xl',
                  PANEL_TAB_VARIANTS[activeSection === key ? 'active' : 'inactive'],
                )}
              >
                <Icon size={15} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

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
        title="מחיקת דוח"
        message="האם למחוק את הדוח? פעולה זו אינה הפיכה."
        confirmLabel="מחק"
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
