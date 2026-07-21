import type { RefObject } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { ToolbarContainer } from '@/components/ui/layout/ToolbarContainer'
import { Input } from '@/components/ui/inputs/Input'
import { GLOBAL_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'

interface SearchToolbarProps {
  inputRef: RefObject<HTMLInputElement | null>
  queryDraft: string
  onQueryDraftChange: (value: string) => void
}

/** One place to type — the term is the page's entire input surface. */
export const SearchToolbar: React.FC<SearchToolbarProps> = ({ inputRef, queryDraft, onQueryDraftChange }) => (
  <ToolbarContainer>
    <Input
      ref={inputRef}
      type="text"
      value={queryDraft}
      onChange={(event) => onQueryDraftChange(event.target.value)}
      placeholder={GLOBAL_SEARCH_PLACEHOLDER}
      startIcon={<SearchIcon className="h-4 w-4" />}
      autoFocus
    />
  </ToolbarContainer>
)

SearchToolbar.displayName = 'SearchToolbar'
