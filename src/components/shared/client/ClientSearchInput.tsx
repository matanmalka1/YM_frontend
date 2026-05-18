import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/inputs/Input'
import { searchApi } from '@/features/search/api'
import type { SearchResult } from '@/features/search/api'
import { formatClientOfficeId } from '@/utils/utils'

// ── Controlled search input (value/onChange) ──────────────────────────────────

interface ClientSearchInputProps {
  value: string
  onChange: (query: string) => void
  onSelect: (client: { id: number; name: string; id_number: string; client_status?: string | null }) => void
  error?: string
  label?: string
  placeholder?: string
  helperText?: string
}

export const ClientSearchInput: React.FC<ClientSearchInputProps> = ({
  value,
  onChange,
  onSelect,
  error,
  label = 'לקוח',
  placeholder = 'חפש לפי שם, ת.ז. / ח.פ...',
  helperText,
}) => {
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [listPosition, setListPosition] = useState<React.CSSProperties>({})

  const updateListPosition = () => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    setListPosition({
      position: 'fixed',
      top: rect.bottom + 2,
      left: rect.left,
      width: rect.width,
      zIndex: 80,
    })
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (containerRef.current && !containerRef.current.contains(target) && !listRef.current?.contains(target)) {
        setOpen(false)
        setHighlightedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!open) return
    updateListPosition()
    window.addEventListener('resize', updateListPosition)
    window.addEventListener('scroll', updateListPosition, true)
    return () => {
      window.removeEventListener('resize', updateListPosition)
      window.removeEventListener('scroll', updateListPosition, true)
    }
  }, [open, results.length])

  const handleChange = (query: string) => {
    onChange(query)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.trim().length < 2) {
      setResults([])
      setOpen(false)
      setHighlightedIndex(-1)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await searchApi.search({ query: query.trim(), page_size: 8 })
        const clientResults = res.results.filter((r) => r.result_type === 'client')
        setResults(clientResults)
        setOpen(clientResults.length > 0)
        if (clientResults.length > 0) requestAnimationFrame(updateListPosition)
        setHighlightedIndex(clientResults.length > 0 ? 0 : -1)
      } catch {
        setResults([])
        setOpen(false)
        setHighlightedIndex(-1)
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  const handleSelect = (result: SearchResult) => {
    onSelect({
      id: result.client_id,
      name: result.client_name,
      id_number: '',
      client_status: result.client_status,
    })
    setOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (!open || results.length === 0) {
      if (event.key === 'Escape') {
        setOpen(false)
        setHighlightedIndex(-1)
      }
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightedIndex((prev) => (prev + 1) % results.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1))
      return
    }

    if (event.key === 'Enter') {
      const selected = results[highlightedIndex] ?? results[0]
      if (!selected) return
      event.preventDefault()
      handleSelect(selected)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      setHighlightedIndex(-1)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        ref={inputRef}
        label={label}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        error={error}
        role="combobox"
        aria-expanded={open}
        aria-controls="client-search-results"
        aria-activedescendant={
          highlightedIndex >= 0 ? `client-search-option-${results[highlightedIndex]?.client_id}` : undefined
        }
        startIcon={<Search className="h-4 w-4" />}
        endElement={
          loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          ) : value ? (
            <button
              type="button"
              onClick={() => {
                onChange('')
                setResults([])
                setOpen(false)
                setHighlightedIndex(-1)
              }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : undefined
        }
      />

      {helperText && !value.trim() && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}

      {open &&
        results.length > 0 &&
        createPortal(
          <ul
            ref={listRef}
            id="client-search-results"
            role="listbox"
            className="box-border max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 text-right shadow-xl"
            style={listPosition}
            dir="rtl"
          >
            {results.map((result, index) => (
              <li
                id={`client-search-option-${result.client_id}`}
                key={result.client_id}
                role="option"
                aria-selected={highlightedIndex === index}
                onMouseDown={() => handleSelect(result)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`flex cursor-pointer flex-col gap-0.5 px-4 py-2.5 text-sm ${
                  highlightedIndex === index ? 'bg-primary-50' : 'hover:bg-primary-50'
                }`}
              >
                <span className="font-medium leading-5 text-gray-900">{result.client_name}</span>
                <span className="text-xs leading-4 text-gray-400">
                  {result.office_client_number != null
                    ? `מס׳ לקוח ${formatClientOfficeId(result.office_client_number)}`
                    : 'מס׳ לקוח לא זמין'}
                </span>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  )
}

ClientSearchInput.displayName = 'ClientSearchInput'

// ── Selected-client display (with clear button) ───────────────────────────────

interface SelectedClientDisplayProps {
  name: string
  id: number
  onClear: () => void
  label?: string
}

export const SelectedClientDisplay: React.FC<SelectedClientDisplayProps> = ({ name, id, onClear, label = 'לקוח' }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-3">
      <span className="flex-1 text-sm font-medium text-primary-900">{name}</span>
      <span className="text-xs text-primary-500">{formatClientOfficeId(id)}</span>
      <button
        type="button"
        onClick={onClear}
        className="rounded p-0.5 text-primary-400 hover:bg-primary-100 hover:text-primary-600"
        aria-label="נקה בחירה"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
)

SelectedClientDisplay.displayName = 'SelectedClientDisplay'
