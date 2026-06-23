import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import type { FilterFieldDef } from '@/components/ui/filters/types'
import {
  getOperationalYearOptions,
  getOperationalTaxYear,
} from '@/constants/periodOptions.constants'
import { getAdvancePaymentStatusLabel, ADVANCE_PAYMENT_STATUS_FILTERS } from '../../constants'
import { useClientAdvancePaymentsTab } from '../../hooks/useClientAdvancePaymentsTab'
import { ClientAdvancePaymentsHeader } from './ClientAdvancePaymentsHeader'
import { ClientAdvancePaymentsCards } from './ClientAdvancePaymentsCards'
import { ClientAdvancePaymentsStatsSection } from './ClientAdvancePaymentsStatsSection'
import { AdvancePaymentDrawer } from '../../components/drawer/AdvancePaymentDrawer'
import { CreateAdvancePaymentModal } from '../../components/create/CreateAdvancePaymentModal'
import { PaginationCard } from '@/components/ui/table/PaginationCard'

interface ClientAdvancePaymentsTabProps {
  clientRecordId: number
  clientName?: string | null
  clientIdNumber?: string | null
  officeClientNumber?: number | null
}

const CLIENT_ADVANCE_PAYMENTS_FILTER_FIELDS: FilterFieldDef[] = [
  {
    type: 'toggle',
    key: 'status_filter',
    label: 'סטטוס',
    options: ADVANCE_PAYMENT_STATUS_FILTERS.map((status) => ({
      value: status,
      label: getAdvancePaymentStatusLabel(status),
    })),
  },
  {
    type: 'select',
    key: 'year',
    label: 'שנה',
    options: getOperationalYearOptions(),
    defaultValue: String(getOperationalTaxYear()),
  },
]

export const ClientAdvancePaymentsTab: React.FC<ClientAdvancePaymentsTabProps> = (props) => {
  const { permissions, header, filters, kpi, table, pagination, drawer, createModal } =
    useClientAdvancePaymentsTab(props)

  return (
    <div className="space-y-6">
      <ClientAdvancePaymentsHeader {...header} />

      <ClientAdvancePaymentsStatsSection {...kpi} />

      <FilterPanel
        fields={CLIENT_ADVANCE_PAYMENTS_FILTER_FIELDS}
        values={filters.values}
        onChange={filters.onChange}
        onReset={filters.onReset}
        gridClass="grid-cols-1 sm:grid-cols-2"
      />

      <ClientAdvancePaymentsCards {...table} />

      {pagination.totalPages > 1 && (
        <PaginationCard
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          label="מקדמות"
          onPageChange={pagination.onPageChange}
        />
      )}

      <AdvancePaymentDrawer key={drawer.row?.id ?? 'empty'} {...drawer} />

      {permissions.isAdvisor && <CreateAdvancePaymentModal {...createModal} />}
    </div>
  )
}
