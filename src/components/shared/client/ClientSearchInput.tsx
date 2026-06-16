import { useState, useRef, useEffect, useCallback, useId } from 'react'
import { createPortal } from 'react-dom'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/inputs/Input'
import { clientsApi, type ClientRecordListItem } from '@/features/clients'
import { formatClientOfficeId } from '@/utils/utils'
import { CLIENT_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'

// ── Controlled search input (value/onChange) ──────────────────────────────────

export interface ClientSearchSelection {
  id: number
  name: string
  id_number: string
  client_status?: string | null
  office_client_number?: number | null
}

interface ClientSearchInputProps {
  value: string
  onChange: (query: string) => void
  onSelect: (client: ClientSearchSelection) => void
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
  placeholder = CLIENT_SEARCH_PLACEHOLDER,
  helperText,
}) => {
  const [results, setResults] = useState<ClientRecordListItem[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [listPosition, setListPosition] = useState<React.CSSProperties>({})
  const listboxId = useId()

  const updateListPosition = useCallback(() => {
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
  }, [])

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
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
    }
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
  }, [open, results.length, updateListPosition])

  const invalidatePendingSearch = useCallback(() => {
    requestIdRef.current += 1
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
  }, [])

  const handleChange = (query: string) => {
    onChange(query)
    invalidatePendingSearch()

    if (query.trim().length < 2) {
      setResults([])
      setOpen(false)
      setHighlightedIndex(-1)
      setLoading(false)
      return
    }

    const requestId = requestIdRef.current
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await clientsApi.list({ search: query.trim(), page_size: 8 })
        if (requestId !== requestIdRef.current) return
        setResults(res.items)
        setOpen(true)
        requestAnimationFrame(updateListPosition)
        setHighlightedIndex(res.items.length > 0 ? 0 : -1)
      } catch {
        if (requestId !== requestIdRef.current) return
        setResults([])
        setOpen(false)
        setHighlightedIndex(-1)
      } finally {
        if (requestId === requestIdRef.current) setLoading(false)
      }
    }, 300)
  }

  const handleSelect = (result: ClientRecordListItem) => {
    onSelect({
      id: result.id,
      name: result.full_name,
      id_number: result.id_number,
      client_status: result.status,
      office_client_number: result.office_client_number,
    })
    setOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }

  const handleClear = () => {
    invalidatePendingSearch()
    onChange('')
    setResults([])
    setOpen(false)
    setHighlightedIndex(-1)
    setLoading(false)
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

  const showNoResults = open && results.length === 0 && !loading && value.trim().length >= 2

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
        aria-controls={listboxId}
        aria-activedescendant={
          highlightedIndex >= 0 ? `${listboxId}-option-${results[highlightedIndex]?.id}` : undefined
        }
        startIcon={<Search className="h-4 w-4" />}
        endElement={
          loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          ) : value ? (
            <button type="button" onClick={handleClear} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          ) : undefined
        }
      />

      {helperText && !value.trim() && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}

      {open &&
        (results.length > 0 || showNoResults) &&
        createPortal(
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            className="box-border max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 text-right shadow-xl"
            style={listPosition}
            dir="rtl"
          >
            {showNoResults ? (
              <li role="presentation" className="px-4 py-2.5 text-sm text-gray-400">
                לא נמצאו לקוחות
              </li>
            ) : (
              results.map((result, index) => (
                <li
                  id={`${listboxId}-option-${result.id}`}
                  key={result.id}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  onMouseDown={() => handleSelect(result)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex cursor-pointer flex-col gap-0.5 px-4 py-2.5 text-sm ${
                    highlightedIndex === index ? 'bg-primary-50' : 'hover:bg-primary-50'
                  }`}
                >
                  <span className="font-medium leading-5 text-gray-900">{result.full_name}</span>
                  <span className="text-xs leading-4 text-gray-400">
                    {result.office_client_number != null
                      ? `מס׳ לקוח ${formatClientOfficeId(result.office_client_number)}`
                      : 'מס׳ לקוח לא זמין'}
                  </span>
                </li>
              ))
            )}
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
  officeClientNumber?: number | null
  onClear: () => void
  label?: string
}

export const SelectedClientDisplay: React.FC<SelectedClientDisplayProps> = ({
  name,
  officeClientNumber,
  onClear,
  label = 'לקוח',
}) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-3">
      <span className="flex-1 text-sm font-medium text-primary-900">{name}</span>
      <span className="text-xs text-primary-500">
        {officeClientNumber != null ? formatClientOfficeId(officeClientNumber) : 'מס׳ לקוח לא זמין'}
      </span>
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
