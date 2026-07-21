import { useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { InlineState } from '@/components/ui/feedback'
import {
  AuditTrailTable,
  AUDIT_ACTION_LABELS,
  makeAuditFormatter,
  useEntityAuditTrail,
  type FieldValueLabels,
} from '@/features/audit'
import { PAGE_SIZE_SM } from '@/constants/pagination.constants'
import { getVatWorkItemStatusLabel, VAT_FILING_METHOD_LABELS, VAT_WORK_ITEM_STATUS_VALUES } from '../../constants/vatConstants'
import type { VatHistoryTabProps } from '../../types'
import { VAT_MESSAGES } from '../../messages'
import { VAT_ERROR_MESSAGES } from '../../errorMessages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

const vatStatusLabels: Record<string, string> = Object.fromEntries(
  VAT_WORK_ITEM_STATUS_VALUES.map((status) => [status, getVatWorkItemStatusLabel(status)]),
)

const vatFieldValueLabels: FieldValueLabels = {
  status: vatStatusLabels,
  submission_method: VAT_FILING_METHOD_LABELS,
}

export const VatHistoryTab: React.FC<VatHistoryTabProps> = ({ workItemId }) => {
  const [page, setPage] = useState(0)
  const { items, total, isFetching, isPending, isError, refetch } = useEntityAuditTrail(
    'vat_work_item',
    workItemId,
    page,
    PAGE_SIZE_SM,
  )
  const formatDetails = useMemo(() => makeAuditFormatter(vatFieldValueLabels), [])

  if (isPending) return <p className="py-8 text-center text-sm text-gray-400">{GLOBAL_UI_MESSAGES.common.loading}</p>
  if (isError) {
    return (
      <InlineState
        variant="error"
        icon={AlertTriangle}
        title={VAT_ERROR_MESSAGES.detail.loadingHistoryError}
        action={{ label: GLOBAL_UI_MESSAGES.actions.retry, onClick: () => refetch() }}
      />
    )
  }
  if (total === 0) return <p className="py-8 text-center text-sm text-gray-400">{VAT_MESSAGES.history.empty}</p>

  return (
    <AuditTrailTable
      items={items}
      actionLabels={AUDIT_ACTION_LABELS}
      formatDetails={formatDetails}
      page={page}
      pageSize={PAGE_SIZE_SM}
      total={total}
      isFetching={isFetching}
      onPageChange={setPage}
      detailsTruncate
    />
  )
}

VatHistoryTab.displayName = 'VatHistoryTab'
