import { Edit2, Trash2 } from 'lucide-react'
import { Badge } from '../../../components/ui/primitives/Badge'
import { Button } from '../../../components/ui/primitives/Button'
import type { CorrespondenceEntry as CorrespondenceEntryType } from '../api'
import { formatDate } from '../../../utils/utils'
import { CORRESPONDENCE_TYPE_CONFIG } from '../constants'
import { CORRESPONDENCE_MESSAGES } from '../messages'

interface CorrespondenceEntryItemProps {
  entry: CorrespondenceEntryType
  isDeleting: boolean
  onEdit: (entry: CorrespondenceEntryType) => void
  onDelete: (id: number) => void
}

export const CorrespondenceEntryItem = ({ entry, isDeleting, onEdit, onDelete }: CorrespondenceEntryItemProps) => {
  const config = CORRESPONDENCE_TYPE_CONFIG[entry.correspondence_type]
  const Icon = config.icon

  return (
    <li className="flex gap-4 py-3 pl-2">
      <div className="relative shrink-0 pt-0.5">
        <div className={`h-4 w-4 rounded-full border-2 border-white shadow-sm ${config.dotColor}`} />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0">
              <Badge variant={config.variant} icon={<Icon className="h-3.5 w-3.5" />}>
                {config.label}
              </Badge>
            </span>
            <p className="truncate text-sm font-semibold text-gray-900">{entry.subject}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <time className="text-xs text-gray-400 tabular-nums">{formatDate(entry.occurred_at)}</time>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={<Edit2 className="h-3.5 w-3.5" />}
              onClick={() => onEdit(entry)}
              className="h-6 w-6 p-0"
              title={CORRESPONDENCE_MESSAGES.entry.editTitle}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={<Trash2 className="h-3.5 w-3.5" />}
              isLoading={isDeleting}
              onClick={() => onDelete(entry.id)}
              className="h-6 w-6 p-0 text-negative-600 hover:bg-negative-50"
              title={CORRESPONDENCE_MESSAGES.entry.deleteTitle}
            />
          </div>
        </div>

        {entry.notes && <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{entry.notes}</p>}
      </div>
    </li>
  )
}

CorrespondenceEntryItem.displayName = 'CorrespondenceEntryItem'
