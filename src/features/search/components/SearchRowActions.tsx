import { FileText, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { SearchResult } from '../api'
import { toQueryParams } from '../../../api/queryParams'
import { RowActionButton } from '@/components/ui/table'
import { SEARCH_MESSAGES } from '../messages'

const buildBinderUrl = (result: SearchResult): string | null => {
  if (!result.binder_id) return null
  const params = toQueryParams({ binder_id: result.binder_id, client_record_id: result.client_record_id })
  return `/binders?${params.toString()}`
}

interface SearchRowActionsProps {
  result: SearchResult
}

export const SearchRowActions: React.FC<SearchRowActionsProps> = ({ result }) => {
  const navigate = useNavigate()
  const binderUrl = buildBinderUrl(result)

  return (
    <div className="flex items-center justify-end gap-1">
      <RowActionButton
        label={SEARCH_MESSAGES.actions.clientDetails}
        icon={<User className="h-4 w-4" />}
        onClick={() => navigate(`/clients/${result.client_record_id}`)}
      />
      {binderUrl && (
        <RowActionButton
          label={SEARCH_MESSAGES.actions.binderDetails}
          icon={<FileText className="h-4 w-4" />}
          onClick={() => navigate(binderUrl)}
        />
      )}
    </div>
  )
}

SearchRowActions.displayName = 'SearchRowActions'
