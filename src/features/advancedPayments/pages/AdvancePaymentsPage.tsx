import { PlusCircle, Calendar } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/primitives/Button'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { MonthlyAccordionList } from '@/components/ui/table/MonthlyAccordionGroup'
import { AdvancePaymentsStatsCards } from '../components/stats/AdvancePaymentsStatsCards'
import { AdvancePaymentBatchRow } from '../components/table/AdvancePaymentBatchRow'
import { AdvancePaymentDrawer } from '../components/drawer/AdvancePaymentDrawer'
import { CreateAdvancePaymentFlow } from '../components/create/CreateAdvancePaymentFlow'
import { GenerateScheduleModal } from '../components/create/GenerateScheduleModal'
import { reportingPeriodIncludesMonth } from '@/utils/reportingPeriod'
import { ADVANCE_PAYMENTS_FILTER_FIELDS } from '../advancedPaymentsPage.constants'
import { getAdvancePaymentBatchKey } from '../advancedPaymentsPage.utils'
import { useAdvancePaymentsPage } from '../hooks/useAdvancePaymentsPage'

export const AdvancePayments: React.FC = () => {
  const page = useAdvancePaymentsPage()

  return (
    <div className="space-y-6">
      <PageHeader
        title="מקדמות מס הכנסה"
        description="מעקב שנתי אחר תשלומים, פיגורים וגבייה"
        actions={
          page.isAdvisor ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={page.openGenerate}>
                צור לוח שנתי
                <Calendar className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={page.openCreate}>
                הוסף מקדמה
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          ) : undefined
        }
      />

      <AdvancePaymentsStatsCards
        dueThisMonthCount={page.workflowStats.dueThisMonthCount}
        pendingCount={page.workflowStats.pendingCount}
        missingTurnoverCount={page.workflowStats.missingTurnoverCount}
        overdueCount={page.workflowStats.overdueCount}
      />

      <FilterPanel
        fields={ADVANCE_PAYMENTS_FILTER_FIELDS}
        values={page.filterValues}
        onChange={page.changeFilter}
        onMultiChange={page.changeFilters}
        onReset={page.resetFilters}
        gridClass="grid-cols-1 sm:grid-cols-4"
      />

      <MonthlyAccordionList
        isLoading={page.isLoading}
        isEmpty={!page.isLoading && page.batches.length === 0}
        emptyState={{ message: page.year === null ? 'אין מקדמות' : `אין מקדמות לשנה ${page.year}` }}
        skeletonCols={11}
      >
        {page.displayBatches.map((batch) => {
          const stableKey = getAdvancePaymentBatchKey(batch)
          const isDefaultOpen = stableKey === page.defaultOpenBatchKey
          const isCurrentPeriod = reportingPeriodIncludesMonth(
            batch.year,
            batch.month,
            batch.period_months_count,
            page.currentReportingYear,
            page.currentReportingMonth,
          )
          return (
            <AdvancePaymentBatchRow
              key={stableKey}
              batch={batch}
              defaultOpen={isDefaultOpen}
              isCurrentPeriod={isCurrentPeriod}
              clientRecordId={page.clientRecordId}
              statusFilter={page.statusFilter}
              periodFilter={page.periodFilter}
              onRowClick={page.openRow}
              onNavigateToClient={page.navigateToClient}
            />
          )
        })}
      </MonthlyAccordionList>

      <AdvancePaymentDrawer
        row={page.drawerRow}
        open={page.drawerRow !== null}
        isUpdating={page.isUpdating}
        canEdit={page.isAdvisor}
        onClose={page.closeDrawer}
        onSave={page.saveRow}
      />

      <CreateAdvancePaymentFlow open={page.createOpen} year={page.year ?? page.todayYear} onClose={page.closeCreate} />

      <GenerateScheduleModal open={page.generateOpen} year={page.year ?? page.todayYear} onClose={page.closeGenerate} />
    </div>
  )
}
