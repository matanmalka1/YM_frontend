import { ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { SearchResult } from '../api'
import { toQueryParams } from '../../../api/queryParams'
import { RowActionButton } from '@/components/ui/table'

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

  if (!url) return <span className="text-sm text-gray-300">—</span>

  return <RowActionButton label="פירוט" icon={<ExternalLink className="h-4 w-4" />} onClick={() => navigate(url)} />
}

SearchRowActions.displayName = 'SearchRowActions'
