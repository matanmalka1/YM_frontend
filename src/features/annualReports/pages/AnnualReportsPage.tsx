import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import { PageLoading } from '@/components/ui/layout/PageLoading'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { CreateReportModal } from '../components/shared/CreateReportModal'
import { OverdueBanner } from '../components/shared/OverdueBanner'
import { SeasonProgressBar } from '../components/season/SeasonProgressBar'
import { SeasonReportsTable } from '../components/season/SeasonReportsTable'
import { useAnnualReportsPage } from '../hooks/useAnnualReportsPage'
import { ANNUAL_REPORTS_MESSAGES } from '@/features/annualReports/messages'

export const AnnualReportsPage: React.FC = () => {
  const { status, headerProps, stats, filters, table, banner, modals } = useAnnualReportsPage()

  return (
    <PageContent>
      <PageHeader
        title={headerProps.title}
        description={headerProps.description}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={modals.openCreate}
            disabled={!headerProps.taxYear}
          >
            {headerProps.taxYear
              ? ANNUAL_REPORTS_MESSAGES.page.newReportButton(headerProps.taxYear)
              : ANNUAL_REPORTS_MESSAGES.page.newReportButtonFallback}
          </Button>
        }
      />

      {banner.overdue.length > 0 && <OverdueBanner overdue={banner.overdue} onSelect={banner.onSelect} />}

      {status.isLoading && <PageLoading message={ANNUAL_REPORTS_MESSAGES.page.loadingSeason} />}
      {status.error && <Alert variant="error" message={status.error} />}

      {!status.isLoading && !status.error && stats.summary && (
        <>
          <SeasonProgressBar summary={stats.summary} />

          <FilterPanel
            {...filters}
            title={ANNUAL_REPORTS_MESSAGES.page.filterTitle}
            subtitle={ANNUAL_REPORTS_MESSAGES.page.filterSubtitle}
          />

          <SeasonReportsTable
            reports={table.reports}
            isLoading={table.isLoading}
            taxYear={table.taxYear}
            onSelect={table.onSelect}
          />
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
