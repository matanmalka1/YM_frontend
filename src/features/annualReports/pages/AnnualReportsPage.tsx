import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import { PageLoading } from '@/components/ui/layout/PageLoading'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import {
  CreateReportModal,
  OverdueBanner,
  SeasonProgressBar,
  SeasonReportsTable,
  SeasonSummaryCards,
  useAnnualReportsPage,
} from '@/features/annualReports'

export const AnnualReportsPage: React.FC = () => {
  const { status, headerProps, stats, filters, table, banner, modals } = useAnnualReportsPage()

  return (
    <PageContent>
      <PageHeader
        title={headerProps.title}
        description={headerProps.description}
        actions={
          <Button
            variant="ghost"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            iconPosition="end"
            onClick={modals.openCreate}
            disabled={!headerProps.taxYear}
          >
            {headerProps.taxYear ? `דוח שנתי ${headerProps.taxYear}` : 'דוח שנתי'}
          </Button>
        }
      />

      {banner.overdue.length > 0 && <OverdueBanner overdue={banner.overdue} onSelect={banner.onSelect} />}

      <FilterPanel {...filters} title="סינון דוחות שנתיים" subtitle="לקוח, סטטוס ושנת מס" />

      {status.isLoading && <PageLoading message="טוען נתוני עונה..." />}
      {status.error && <Alert variant="error" message={status.error} />}

      {!status.isLoading && !status.error && stats.summary && (
        <>
          <SeasonSummaryCards summary={stats.summary} />
          <SeasonProgressBar summary={stats.summary} />
          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">כל הדוחות — שנת מס {table.taxYear}</h2>
            <SeasonReportsTable
              reports={table.reports}
              isLoading={table.isLoading}
              taxYear={table.taxYear}
              onSelect={table.onSelect}
            />
          </div>
        </>
      )}

      {!status.isLoading && !status.error && !stats.summary && (
        <StateCard
          icon={table.emptyState.icon}
          variant={table.emptyState.variant}
          title={table.emptyState.title}
          message={table.emptyState.message}
          action={table.emptyState.action}
        />
      )}

      <CreateReportModal {...modals.createProps} />
    </PageContent>
  )
}
