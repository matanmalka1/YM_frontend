import { Plus, FileText } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageLoading } from '@/components/ui/layout/PageLoading'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { StateCard } from '@/components/ui/feedback/StateCard'
import {
  AnnualReportsFiltersBar,
  CreateReportModal,
  OverdueBanner,
  SeasonProgressBar,
  SeasonReportsTable,
  SeasonSummaryCards,
  useAnnualReportsPage,
} from '@/features/annualReports'

export const AnnualReportsPage: React.FC = () => {
  const {
    taxYear,
    filingSeasonYear,
    defaultTaxYear,
    showCreate,
    openCreate,
    closeCreate,
    openReport,
    filters,
    handleFilterChange,
    handleResetFilters,
    filteredReports,
    season,
  } = useAnnualReportsPage()
  const taxYearLabel = taxYear ? String(taxYear) : '...'

  return (
    <div className="space-y-6">
      <PageHeader
        title={`דוחות שנתיים לשנת המס ${taxYearLabel}`}
        description={filingSeasonYear ? `עונת הגשה ${filingSeasonYear}` : 'ניהול ומעקב אחר דוחות שנתיים'}
        actions={
          <Button variant="ghost" size="sm" onClick={openCreate} disabled={!taxYear} className="gap-2">
            {taxYear ? `דוח שנתי ${taxYear}` : 'דוח שנתי'}
            <Plus className="h-4 w-4" />
          </Button>
        }
      />

      {season.overdue.length > 0 && <OverdueBanner overdue={season.overdue} onSelect={openReport} />}

      <AnnualReportsFiltersBar
        filters={filters}
        defaultYear={defaultTaxYear}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {season.isLoading && <PageLoading message="טוען נתוני עונה..." />}
      {season.error && <Alert variant="error" message={season.error} />}

      {!season.isLoading && !season.error && season.summary && (
        <>
          <SeasonSummaryCards summary={season.summary} />
          <SeasonProgressBar summary={season.summary} />
          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">כל הדוחות — שנת מס {taxYear}</h2>
            <SeasonReportsTable
              reports={filteredReports}
              isLoading={season.isLoading}
              taxYear={taxYear}
              onSelect={(report) => openReport(report.id)}
            />
          </div>
        </>
      )}

      {!season.isLoading && !season.error && !season.summary && (
        <StateCard
          icon={FileText}
          variant="illustration"
          title={`עדיין אין דוחות שנתיים לשנת המס ${taxYearLabel}`}
          message={taxYear ? `לחץ על "דוח שנתי ${taxYear}" כדי להתחיל` : 'בחר שנת מס כדי להתחיל'}
          action={taxYear ? { label: `דוח שנתי ${taxYear}`, onClick: openCreate } : undefined}
        />
      )}

      <CreateReportModal open={showCreate} onClose={closeCreate} taxYear={taxYear} />
    </div>
  )
}
