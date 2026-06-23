import { PlusCircle, Calendar } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import { Button } from '@/components/ui/primitives/Button'
import { AdvancePaymentsStatsSection } from '../components/stats/AdvancePaymentsStatsSection'
import { AdvancePaymentBatchesList } from '../components/table/AdvancePaymentBatchesList'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import { AdvancePaymentDrawer } from '../components/drawer/AdvancePaymentDrawer'
import { CreateAdvancePaymentFlow } from '../components/create/CreateAdvancePaymentFlow'
import { GenerateScheduleModal } from '../components/create/GenerateScheduleModal'
import { useAdvancePaymentsPage } from '../hooks/useAdvancePaymentsPage'

export const AdvancePayments: React.FC = () => {
  const { status, headerProps, permissions, stats, filters, table, drawers, modals } = useAdvancePaymentsPage()

  return (
    <PageContent>
      <PageHeader
        {...headerProps}
        actions={
          permissions.isAdvisor ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={<Calendar className="h-4 w-4" />}
                iconPosition="end"
                onClick={modals.openGenerate}
              >
                צור לוח שנתי
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<PlusCircle className="h-4 w-4" />}
                iconPosition="end"
                onClick={modals.openCreate}
              >
                הוסף מקדמה
              </Button>
            </div>
          ) : undefined
        }
      />

      <AdvancePaymentsStatsSection
        dueThisMonthCount={stats.workflowStats.dueThisMonthCount}
        pendingCount={stats.workflowStats.pendingCount}
        missingTurnoverCount={stats.workflowStats.missingTurnoverCount}
        overdueCount={stats.workflowStats.overdueCount}
      />

      <FilterPanel {...filters} title="סינון מקדמות" subtitle="לקוח, שנה, סטטוס ותקופה" />

      <AdvancePaymentBatchesList isLoading={status.isLoading} {...table} />

      <AdvancePaymentDrawer key={drawers.payment.row?.id ?? 'empty'} {...drawers.payment} />

      <CreateAdvancePaymentFlow {...modals.create} />

      <GenerateScheduleModal {...modals.generate} />
    </PageContent>
  )
}
