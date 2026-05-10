import { ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { SearchResult } from '../api'
import { toQueryParams } from '../../../api/queryParams'

const buildDetailUrl = (result: SearchResult): string | null => {
  if (result.result_type === 'client') return `/clients/${result.client_id}`
  if (result.result_type === 'binder' && result.binder_id) {
    const params = toQueryParams({ binder_id: result.binder_id, client_id: result.client_id })
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

  return (
    <button
      type="button"
      title="פירוט"
      aria-label="פירוט"
      onClick={(e) => {
        e.stopPropagation()
        navigate(url)
      }}
      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
    >
      <ExternalLink className="h-4 w-4" />
    </button>
  )
}

SearchRowActions.displayName = 'SearchRowActions'
