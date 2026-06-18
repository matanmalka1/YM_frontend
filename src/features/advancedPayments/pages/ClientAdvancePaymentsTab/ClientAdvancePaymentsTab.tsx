import { useClientAdvancePaymentsTab } from '../../hooks/useClientAdvancePaymentsTab'
import { ClientAdvancePaymentsHeader } from './ClientAdvancePaymentsHeader'
import { ClientAdvancePaymentCards } from './ClientAdvancePaymentCards'
import { AdvancePaymentsStatsCards } from '../../components/stats/AdvancePaymentsStatsCards'
import { AdvancePaymentDrawer } from '../../components/drawer/AdvancePaymentDrawer'
import { CreateAdvancePaymentModal } from '../../components/create/CreateAdvancePaymentModal'
import { PaginationCard } from '../../../../components/ui/table/PaginationCard'

interface ClientAdvancePaymentsTabProps {
  clientRecordId: number
  clientName?: string | null
  clientIdNumber?: string | null
  officeClientNumber?: number | null
}

export const ClientAdvancePaymentsTab: React.FC<ClientAdvancePaymentsTabProps> = (props) => {
  const { permissions, header, kpi, table, pagination, drawer, createModal } = useClientAdvancePaymentsTab(props)

  return (
    <div className="space-y-6">
      <ClientAdvancePaymentsHeader {...header} />

      <AdvancePaymentsStatsCards {...kpi} />

      <ClientAdvancePaymentCards {...table} />

      {pagination.totalPages > 1 && (
        <PaginationCard
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          label="מקדמות"
          onPageChange={pagination.onPageChange}
        />
      )}

      <AdvancePaymentDrawer {...drawer} />

      {permissions.isAdvisor && <CreateAdvancePaymentModal {...createModal} />}
    </div>
  )
}
