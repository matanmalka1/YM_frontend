import { GLOBAL_UI_MESSAGES } from '@/messages'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import type { FilterFieldDef } from '@/components/ui/filters/types'
import { getOperationalYearOptions, getOperationalTaxYear } from '@/constants/periodOptions.constants'
import { ADVANCE_PAYMENT_STATUS_OPTIONS } from '../../constants'
import { useClientAdvancePaymentsTab } from '../../hooks/useClientAdvancePaymentsTab'
import { ClientAdvancePaymentsHeader } from './ClientAdvancePaymentsHeader'
import { ClientAdvancePaymentsCards } from './ClientAdvancePaymentsCards'
import { ClientAdvancePaymentsStatsSection } from './ClientAdvancePaymentsStatsSection'
import { CreateAdvancePaymentModal } from '../../components/create/CreateAdvancePaymentModal'
import { PaginationCard } from '@/components/ui/table'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface ClientAdvancePaymentsTabProps {
  clientRecordId: number
}

const CLIENT_ADVANCE_PAYMENTS_FILTER_FIELDS: FilterFieldDef[] = [
  {
    type: 'toggle',
    key: 'status_filter',
    label: GLOBAL_UI_MESSAGES.common.status,
    options: ADVANCE_PAYMENT_STATUS_OPTIONS,
  },
  {
    type: 'select',
    key: 'year',
    label: ADVANCED_PAYMENTS_MESSAGES.clientTab.yearFilterLabel,
    options: getOperationalYearOptions(),
    defaultValue: String(getOperationalTaxYear()),
  },
]

export const ClientAdvancePaymentsTab: React.FC<ClientAdvancePaymentsTabProps> = (props) => {
  const { permissions, header, filters, kpi, table, pagination, createModal } = useClientAdvancePaymentsTab(props)

  return (
    <div className="space-y-6">
      <ClientAdvancePaymentsHeader {...header} />

      <ClientAdvancePaymentsStatsSection {...kpi} />

      <FilterPanel
        fields={CLIENT_ADVANCE_PAYMENTS_FILTER_FIELDS}
        values={filters.values}
        onChange={filters.onChange}
        onReset={filters.onReset}
      />

      <ClientAdvancePaymentsCards {...table} />

      {pagination.totalPages > 1 && (
        <PaginationCard
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          label={ADVANCED_PAYMENTS_MESSAGES.clientTab.paginationLabel}
          onPageChange={pagination.onPageChange}
        />
      )}

      {permissions.isAdvisor && <CreateAdvancePaymentModal {...createModal} />}
    </div>
  )
}
