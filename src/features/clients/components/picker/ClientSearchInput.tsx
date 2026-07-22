import { useState, useRef, useEffect, useCallback, useId } from 'react'
import { createPortal } from 'react-dom'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/inputs/Input'
import { getOverlayPortalOffset, useOverlayPortalContainer } from '@/components/ui/overlays/OverlayPortalContext'
import { Button } from '@/components/ui/primitives/Button'
import { Spinner } from '@/components/ui/primitives/Spinner'
import { clientsApi, type ClientRecordListItem } from '@/features/clients/api'
import type { ClientStatus } from '@/features/clients/api'
import { cn, formatClientOfficeId } from '@/utils/utils'
import { CLIENT_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'

// ── Controlled search input (value/onChange) ──────────────────────────────────

export interface ClientSearchSelection {
  id: number
  name: string
  id_number: string
  client_status?: ClientStatus | null
  office_client_number?: number | null
}

interface SelectedClientValue {
  name: string
  /** Omit (undefined) when unknown to hide the number; null renders the "not available" fallback. */
  office_client_number?: number | null
}

interface ClientSearchInputProps {
  value: string
  onChange: (query: string) => void
  onSelect: (client: ClientSearchSelection) => void
  /**
   * Selected state: the input shows the client name (primary tint, office number +
   * clear button inside). Typing or clearing calls onClear and resumes search.
   */
  selectedClient?: SelectedClientValue | null
  onClear?: () => void
  error?: string
  label?: string
  /** Inline placement: no visible label, label moves to aria-label. */
  hideLabel?: boolean
  placeholder?: string
  helperText?: string
  size?: 'sm' | 'md'
}

export const ClientSearchInput: React.FC<ClientSearchInputProps> = ({
  value,
  onChange,
  onSelect,
  selectedClient,
  onClear,
  error,
  label = 'לקוח',
  hideLabel,
  placeholder = CLIENT_SEARCH_PLACEHOLDER,
  helperText,
  size = 'md',
}) => {
  const [results, setResults] = useState<ClientRecordListItem[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [listPosition, setListPosition] = useState<React.CSSProperties>({})
  const portalContainer = useOverlayPortalContainer()
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
    // Editing a selected client dissolves the selection and resumes searching.
    if (selectedClient) onClear?.()
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
    if (selectedClient) onClear?.()
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
  const portalOffset = getOverlayPortalOffset(portalContainer)
  const listStyle: React.CSSProperties = {
    ...listPosition,
    top: typeof listPosition.top === 'number' ? listPosition.top - portalOffset.top : listPosition.top,
    left: typeof listPosition.left === 'number' ? listPosition.left - portalOffset.left : listPosition.left,
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        ref={inputRef}
        label={hideLabel ? undefined : label}
        aria-label={hideLabel ? label : undefined}
        className={cn(
          // Inline (toolbar row) placement: pill shape to match the toolbar buttons.
          hideLabel && 'rounded-full',
          selectedClient && 'border-primary-200 bg-primary-50 font-medium text-primary-900',
        )}
        size={size}
        value={selectedClient ? selectedClient.name : value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        error={error}
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={highlightedIndex >= 0 ? `${listboxId}-option-${results[highlightedIndex]?.id}` : undefined}
        startIcon={<Search className="h-4 w-4" />}
        endElement={
          selectedClient ? (
            <span className="flex items-center gap-1">
              {selectedClient.office_client_number !== undefined && (
                <span className="text-xs text-primary-500">
                  {selectedClient.office_client_number != null
                    ? formatClientOfficeId(selectedClient.office_client_number)
                    : 'מס׳ לקוח לא זמין'}
                </span>
              )}
              <Button
                type="button"
                variant="ghost"
                shape="square"
                size="sm"
                icon={<X className="h-3.5 w-3.5" />}
                onClick={handleClear}
                aria-label="נקה בחירה"
              />
            </span>
          ) : loading ? (
            <Spinner size="sm" label="מחפש..." />
          ) : value ? (
            <Button
              type="button"
              variant="ghost"
              shape="square"
              size="sm"
              icon={<X className="h-3.5 w-3.5" />}
              onClick={handleClear}
              aria-label="נקה חיפוש"
            />
          ) : undefined
        }
      />

      {helperText && !selectedClient && !value.trim() && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}

      {open &&
        (results.length > 0 || showNoResults) &&
        portalContainer &&
        createPortal(
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            className="pointer-events-auto box-border max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 text-right shadow-xl"
            style={listStyle}
          >
            {showNoResults ? (
              <div className="px-4 py-2.5 text-sm text-gray-400">לא נמצאו לקוחות</div>
            ) : (
              results.map((result, index) => (
                <div
                  id={`${listboxId}-option-${result.id}`}
                  key={result.id}
                  role="option"
                  tabIndex={-1}
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
                </div>
              ))
            )}
          </div>,
          portalContainer,
        )}
    </div>
  )
}

ClientSearchInput.displayName = 'ClientSearchInput'
