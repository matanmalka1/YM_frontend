import { PageHeader } from '@/components/layout/PageHeader'
import { TaxCalendarFiltersBar } from '../components/list/TaxCalendarFiltersBar'
import { TaxCalendarGroupsContent } from '../components/list/TaxCalendarGroupsContent'
import { TaxCalendarStatsSection } from '../components/list/TaxCalendarStatsSection'
import { useTaxCalendarGroupsPage } from '../hooks/useTaxCalendarGroupsPage'

export const TaxCalendarGroupsPage = () => {
  const { status, headerProps, stats, filters, table } = useTaxCalendarGroupsPage()

  return (
    <div className="space-y-4">
      <PageHeader {...headerProps} />

      <TaxCalendarStatsSection
        summary={stats.summary}
        linkedLabel={stats.linkedLabel}
        showGroupsCount={stats.showGroupsCount}
      />

      <TaxCalendarFiltersBar
        startYear={filters.startYear}
        endYear={filters.endYear}
        obligationType={filters.obligationType}
        status={filters.status}
        onStartYearChange={filters.onStartYearChange}
        onEndYearChange={filters.onEndYearChange}
        onObligationTypeChange={filters.onObligationTypeChange}
        onStatusChange={filters.onStatusChange}
        onReset={filters.onReset}
        clientSearchText={filters.clientSearchText}
        onClientSearchTextChange={filters.onClientSearchTextChange}
        includeEmpty={filters.includeEmpty}
        onIncludeEmptyChange={filters.onIncludeEmptyChange}
      />

      <TaxCalendarGroupsContent
        groups={table.groups}
        isLoading={status.isLoading}
        error={status.error}
        errorFallback={status.errorFallback}
        clientSearchText={table.clientSearchText}
        page={table.page}
        pageSize={table.pageSize}
        total={table.total}
        onPageChange={table.onPageChange}
      />
    </div>
  )
}

TaxCalendarGroupsPage.displayName = 'TaxCalendarGroupsPage'
