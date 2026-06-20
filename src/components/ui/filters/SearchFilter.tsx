import { useImperativeHandle, type Ref } from 'react'
import { Search, X } from 'lucide-react'
import { useSearchDebounce } from '@/hooks/useSearchDebounce'
import { Input } from '@/components/ui/inputs/Input'
import type { SearchFieldDef, SearchFieldHandle } from './types'

interface Props {
  field: SearchFieldDef
  externalValue: string
  onChange: (key: string, value: string) => void
  ref?: Ref<SearchFieldHandle>
}

export const SearchFilter = ({ field, externalValue, onChange, ref }: Props) => {
  const [draft, setDraft] = useSearchDebounce(externalValue, (v) => onChange(field.key, v))

  useImperativeHandle(ref, () => ({
    reset: () => setDraft(''),
  }))

  return (
    <Input
      label={field.label}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      placeholder={field.placeholder}
      startIcon={<Search className="h-4 w-4" />}
      endElement={
        draft ? (
          <button
            type="button"
            onClick={() => {
              setDraft('')
              onChange(field.key, '')
            }}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : undefined
      }
    />
  )
}
SearchFilter.displayName = 'SearchFilter'
