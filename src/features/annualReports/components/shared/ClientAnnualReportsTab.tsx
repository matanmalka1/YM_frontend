import { useState } from 'react'
import { BarChart2, Check, Clock, Plus } from 'lucide-react'
import { useClientAnnualReportsTab } from '../../hooks/useClientAnnualReportsTab'
import type { AnnualReportListItem } from '../../api'
import { STATUS_LABELS } from '../../api'
import { PageLoading } from '../../../../components/ui/layout/PageLoading'
import { Alert } from '../../../../components/ui/overlays/Alert'
import { Button } from '../../../../components/ui/primitives/Button'
import { cn, formatDate } from '../../../../utils/utils'
import { semanticSignalBadgeClasses } from '@/utils/semanticColors'
import { ClientYearComparisonModal } from './ClientYearComparisonModal'
import { CreateReportModal } from './CreateReportModal'
import { AnnualReportFullPanel } from '../panel/AnnualReportFullPanel'

interface ClientAnnualReportsTabProps {
  clientId: number
}

const AnnualReportStatusBanner: React.FC<{
  selectedYear: number
  report: AnnualReportListItem | null
}> = ({ selectedYear, report }) => {
  const submitted = Boolean(report?.submitted_at)
  const Icon = submitted ? Check : Clock
  const statusLabel = report ? STATUS_LABELS[report.status] : 'לא קיים דוח'
  return (
    <div
      className={cn(
        'mb-4 rounded-xl border bg-white px-5 py-4',
        submitted ? 'border-positive-200' : 'border-warning-200',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            submitted ? 'bg-positive-50 text-positive-700' : 'bg-warning-50 text-warning-700',
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 text-right">
          <p className={cn('text-base font-bold', submitted ? 'text-positive-700' : 'text-warning-700')}>
            {submitted ? `דוח שנתי ${selectedYear} הוגש בהצלחה` : `דוח שנתי ${selectedYear} עדיין לא הוגש`}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-500">
            {submitted
              ? `תאריך הגשה: ${formatDate(report?.submitted_at ?? null)}`
              : `מועד הגשה: ${formatDate(report?.filing_deadline ?? null)}`}
          </p>
          <p className="mt-1 text-xs font-semibold text-gray-500">סטטוס: {statusLabel}</p>
        </div>
      </div>
    </div>
  )
}

export const ClientAnnualReportsTab: React.FC<ClientAnnualReportsTabProps> = ({ clientId }) => {
  const {
    selectedYear,
    setSelectedYear,
    allReports,
    selectedReport,
    yearHasReports,
    isPending,
    errorMessage,
    YEAR_LIST,
  } = useClientAnnualReportsTab(clientId)
  const [showComparison, setShowComparison] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const canCompareYears = new Set(allReports.map((report) => report.tax_year)).size >= 2

  if (isPending) return <PageLoading message="טוען דוחות שנתיים..." />
  if (errorMessage) return <Alert variant="error" message={errorMessage} />

  return (
    <>
      <div className="flex justify-end mb-2 gap-2">
        {canCompareYears && (
          <Button variant="ghost" size="sm" onClick={() => setShowComparison(true)}>
            <BarChart2 className="h-4 w-4" />
            השוואה בין שנים
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          דוח חדש
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-1 min-w-[80px]">
          {YEAR_LIST.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium text-right transition-all',
                selectedYear === year
                  ? `border ${semanticSignalBadgeClasses.warning}`
                  : 'text-gray-600 hover:bg-gray-100',
              )}
            >
              {year}
              {yearHasReports(year) && <span className="mr-1 text-xs text-positive-600">✓</span>}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <AnnualReportStatusBanner selectedYear={selectedYear} report={selectedReport ?? null} />
          {selectedReport ? (
            <AnnualReportFullPanel reportId={selectedReport.id} backPath={`/clients/${clientId}`} />
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center text-gray-500">
              <p className="text-base font-medium">אין דוח לשנת מס {selectedYear}</p>
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4" />
                צור דוח חדש
              </Button>
            </div>
          )}
        </div>
      </div>

      <ClientYearComparisonModal
        open={canCompareYears && showComparison}
        onClose={() => setShowComparison(false)}
        reports={allReports}
      />
      <CreateReportModal open={showCreate} onClose={() => setShowCreate(false)} />
    </>
  )
}

ClientAnnualReportsTab.displayName = 'ClientAnnualReportsTab'
