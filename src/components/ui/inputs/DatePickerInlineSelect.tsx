import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../../utils/utils'
import { useDismissibleLayer } from '../overlays/useDismissibleLayer'

interface InlineSelectProps {
  value: number
  options: { label: string; value: number }[]
  onChange: (val: number) => void
}

export const DatePickerInlineSelect: React.FC<InlineSelectProps> = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && listRef.current) {
      const selected = listRef.current.querySelector('[data-selected=true]') as HTMLElement
      if (selected) selected.scrollIntoView({ block: 'nearest' })
    }
  }, [open])

  useDismissibleLayer({ open, triggerRef: ref, layerRef: listRef, onDismiss: () => setOpen(false) })

  const current = options.find((o) => o.value === value)

  // Seed the keyboard highlight to the selected option as we open, rather than syncing it
  // back from props via an effect (which would cost an extra render and run a beat late).
  const openMenu = () => {
    const selectedIndex = options.findIndex((opt) => opt.value === value)
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setOpen(true)
  }

  const moveHighlight = (direction: 1 | -1) => {
    if (options.length === 0) return
    setHighlightedIndex((prev) => {
      if (prev < 0) return direction === 1 ? 0 : options.length - 1
      return (prev + direction + options.length) % options.length
    })
  }

  const handleTriggerKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        openMenu()
        return
      }
      moveHighlight(event.key === 'ArrowDown' ? 1 : -1)
      return
    }

    if ((event.key === 'Enter' || event.key === ' ') && !open) {
      event.preventDefault()
      openMenu()
      return
    }

    if ((event.key === 'Enter' || event.key === ' ') && open) {
      const highlighted = options[highlightedIndex]
      if (!highlighted) return
      event.preventDefault()
      onChange(highlighted.value)
      setOpen(false)
      return
    }

    if (event.key === 'Escape' && open) {
      event.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-800 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current?.label}
        <ChevronDown className={cn('h-3 w-3 text-gray-500 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          ref={listRef}
          className="absolute z-[60] top-full mt-1 start-0 w-28 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl"
          role="listbox"
        >
          {options.map((opt, index) => (
            <button
              key={opt.value}
              type="button"
              data-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                'w-full text-right px-3 py-1.5 text-sm transition-colors',
                highlightedIndex === index && opt.value !== value && 'bg-gray-100',
                opt.value === value ? 'bg-primary-600 text-white font-semibold' : 'text-gray-700 hover:bg-gray-100',
              )}
              role="option"
              aria-selected={opt.value === value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

DatePickerInlineSelect.displayName = 'DatePickerInlineSelect'
