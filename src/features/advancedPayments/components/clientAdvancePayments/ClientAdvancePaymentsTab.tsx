import { PlusCircle } from 'lucide-react'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { Button } from '@/components/ui/primitives/Button'
import { DetailTabPanel } from '@/components/ui/layout'
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
  const { permissions, onOpenCreate, toolbar, filters, kpi, table, pagination, createModal } = useClientAdvancePaymentsTab(props)

  return (
    <DetailTabPanel
      title={ADVANCED_PAYMENTS_MESSAGES.clientTab.title}
      subtitle={ADVANCED_PAYMENTS_MESSAGES.clientTab.subtitle}
      actions={
        permissions.isAdvisor && (
          <Button variant="primary" size="sm" icon={<PlusCircle className="h-4 w-4" />} onClick={onOpenCreate}>
            {ADVANCED_PAYMENTS_MESSAGES.clientHeader.addPayment}
          </Button>
        )
      }
      summary={<ClientAdvancePaymentsStatsSection {...kpi} />}
      filters={
        <FilterPanel
          fields={CLIENT_ADVANCE_PAYMENTS_FILTER_FIELDS}
          values={filters.values}
          onChange={filters.onChange}
          onReset={filters.onReset}
        />
      }
    >
      <ClientAdvancePaymentsHeader {...toolbar} />

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
    </DetailTabPanel>
  )
}
