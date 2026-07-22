import { Search, X } from 'lucide-react'
import { useSearchDebounce } from '@/hooks/useSearchDebounce'
import { Input } from '@/components/ui/inputs/Input'
import type { SearchFieldDef } from './types'

interface Props {
  field: SearchFieldDef
  externalValue: string
  onChange: (key: string, value: string) => void
  size?: 'xs' | 'sm' | 'md'
  fieldClassName?: string
  /** Inline placement (toolbar row): no visible label, label moves to aria-label, pill shape. */
  hideLabel?: boolean
}

// Controlled via `externalValue`: useSearchDebounce syncs the local draft back to it,
// so a parent reset (values[key] -> '') clears the input — no imperative handle needed.
export const SearchFilter = ({ field, externalValue, onChange, size = 'md', fieldClassName, hideLabel }: Props) => {
  const [draft, setDraft] = useSearchDebounce(externalValue, (v) => onChange(field.key, v))

  return (
    <Input
      label={hideLabel ? undefined : field.label}
      aria-label={hideLabel ? field.label : undefined}
      // Inline (toolbar row) placement: pill shape to match the toolbar buttons.
      className={hideLabel ? 'rounded-full' : undefined}
      size={size}
      fieldClassName={fieldClassName}
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
            className="p-0.5 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3 w-3" />
          </button>
        ) : undefined
      }
    />
  )
}
SearchFilter.displayName = 'SearchFilter'
