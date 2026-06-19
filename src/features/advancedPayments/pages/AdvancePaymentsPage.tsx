import { PlusCircle, Calendar } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/primitives/Button'
import { AdvancePaymentsStatsCards } from '../components/stats/AdvancePaymentsStatsCards'
import { AdvancePaymentsBatchesList } from '../components/table/AdvancePaymentsBatchesList'
import { AdvancePaymentsFiltersBar } from '../components/filters/AdvancePaymentsFiltersBar'
import { AdvancePaymentDrawer } from '../components/drawer/AdvancePaymentDrawer'
import { CreateAdvancePaymentFlow } from '../components/create/CreateAdvancePaymentFlow'
import { GenerateScheduleModal } from '../components/create/GenerateScheduleModal'
import { useAdvancePaymentsPage } from '../hooks/useAdvancePaymentsPage'

export const AdvancePayments: React.FC = () => {
  const { status, headerProps, permissions, stats, filters, table, drawers, modals } = useAdvancePaymentsPage()

  return (
    <div className="space-y-6">
      <PageHeader
        {...headerProps}
        actions={
          permissions.isAdvisor ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={modals.openGenerate}>
                צור לוח שנתי
                <Calendar className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={modals.openCreate}>
                הוסף מקדמה
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          ) : undefined
        }
      />

      <AdvancePaymentsStatsCards
        dueThisMonthCount={stats.workflowStats.dueThisMonthCount}
        pendingCount={stats.workflowStats.pendingCount}
        missingTurnoverCount={stats.workflowStats.missingTurnoverCount}
        overdueCount={stats.workflowStats.overdueCount}
      />

      <AdvancePaymentsFiltersBar {...filters} />

      <AdvancePaymentsBatchesList isLoading={status.isLoading} {...table} />

      <AdvancePaymentDrawer {...drawers.payment} />

      <CreateAdvancePaymentFlow {...modals.create} />

      <GenerateScheduleModal {...modals.generate} />
    </div>
  )
}
