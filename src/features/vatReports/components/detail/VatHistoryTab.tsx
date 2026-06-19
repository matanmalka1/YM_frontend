import { useState } from 'react'
import { AuditTrailTable } from '@/features/audit'
import { getTotalPages } from '@/utils/paginationUtils'
import { ACTION_LABELS, PAGE_SIZE } from '../../history.constants'
import { formatVatHistoryDetails } from '../../utils/history'
import { useVatHistory } from '../../hooks/useVatHistory'
import type { VatHistoryTabProps } from '../../types'

export const VatHistoryTab: React.FC<VatHistoryTabProps> = ({ workItemId }) => {
  const [page, setPage] = useState(0)
  const { items, total, isFetching, isPending } = useVatHistory(workItemId, page, PAGE_SIZE)
  const totalPages = getTotalPages(total, PAGE_SIZE)
  const maxPage = totalPages - 1
  const safePage = Math.min(page, maxPage)

  if (isPending) return <p className="py-8 text-center text-sm text-gray-400">טוען...</p>
  if (total === 0) return <p className="py-8 text-center text-sm text-gray-400">אין היסטוריה</p>

  return (
    <AuditTrailTable
      items={items}
      actionLabels={ACTION_LABELS}
      formatDetails={formatVatHistoryDetails}
      totalPages={totalPages}
      maxPage={maxPage}
      safePage={safePage}
      isFetching={isFetching}
      setPage={setPage}
      detailsClassName="text-gray-500 text-xs max-w-xs truncate"
    />
  )
}

VatHistoryTab.displayName = 'VatHistoryTab'
