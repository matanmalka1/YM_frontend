import { ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { SearchResult } from '../api'
import { toQueryParams } from '../../../api/queryParams'
import { EmptyCell, RowActionButton } from '@/components/ui/table'
import { SEARCH_MESSAGES } from '../messages'

const buildDetailUrl = (result: SearchResult): string | null => {
  if (result.result_type === 'client') return `/clients/${result.client_record_id}`
  if (result.result_type === 'binder' && result.binder_id) {
    const params = toQueryParams({ binder_id: result.binder_id, client_record_id: result.client_record_id })
    return `/binders?${params.toString()}`
  }
  return null
}

interface SearchRowActionsProps {
  result: SearchResult
}

export const SearchRowActions: React.FC<SearchRowActionsProps> = ({ result }) => {
  const navigate = useNavigate()
  const url = buildDetailUrl(result)

  if (!url) return <EmptyCell />

  return (
    <RowActionButton
      label={SEARCH_MESSAGES.actions.details}
      icon={<ExternalLink className="h-4 w-4" />}
      onClick={() => navigate(url)}
    />
  )
}

SearchRowActions.displayName = 'SearchRowActions'
