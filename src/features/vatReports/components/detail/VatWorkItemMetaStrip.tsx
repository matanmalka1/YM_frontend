import { CalendarClock, FolderOpen, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MetaItem, MetaStrip } from '@/components/ui/layout'
import { formatDate } from '@/utils/utils'
import { useActiveVatBinder } from '../../hooks/useActiveVatBinder'
import type { VatWorkItemMetaStripProps } from '../../types'
import { VAT_MESSAGES } from '../../messages'

export const VatWorkItemMetaStrip: React.FC<VatWorkItemMetaStripProps> = ({ workItem }) => {
  const { activeBinder } = useActiveVatBinder(workItem.client_record_id)
  const deadline = workItem.extended_deadline ?? workItem.submission_deadline

  return (
    <MetaStrip>
      {activeBinder && (
        <Link
          to={`/binders?binder_number=${activeBinder.binder_number}`}
          className="inline-flex items-center gap-1.5 font-medium text-info-600 transition-colors hover:text-info-700"
        >
          <FolderOpen className="h-4 w-4 shrink-0" />
          {VAT_MESSAGES.detail.binderLabel(activeBinder.binder_number)}
        </Link>
      )}

      {workItem.assigned_to !== null && (
        <MetaItem icon={<User className="h-4 w-4" />} label={VAT_MESSAGES.detail.assigneeLabel}>
          {workItem.assigned_to_name ?? `#${workItem.assigned_to}`}
        </MetaItem>
      )}

      {deadline && (
        <MetaItem icon={<CalendarClock className="h-4 w-4" />} label={VAT_MESSAGES.detail.deadlineLabel}>
          <span className="tabular-nums" dir="ltr">
            {formatDate(deadline)}
          </span>
        </MetaItem>
      )}
    </MetaStrip>
  )
}

VatWorkItemMetaStrip.displayName = 'VatWorkItemMetaStrip'
