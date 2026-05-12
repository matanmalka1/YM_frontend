import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../../utils/utils'
import { useDismissibleLayer } from '../overlays/useDismissibleLayer'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectDropdownProps {
  value?: string | number | readonly string[]
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onBlur?: React.FocusEventHandler<HTMLSelectElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>
  options: SelectOption[]
  disabled?: boolean
  size?: 'xs' | 'sm' | 'md'
  className?: string
  name?: string
  id?: string
}

const triggerSizeClasses = {
  xs: 'h-7 px-2 py-1 text-xs',
  sm: 'h-8 px-2.5 py-1.5 text-sm',
  md: 'h-9 px-3 py-2 text-sm',
}

const optionSizeClasses = {
  xs: 'px-2 py-1.5 text-xs',
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
}

const iconSizeClasses = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-4 w-4',
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  value,
  onChange,
  onBlur,
  onKeyDown,
  options,
  disabled,
  size = 'md',
  className,
  name,
  id,
}) => {
  const [open, setOpen] = useState(false)
  const [internalValue, setInternalValue] = useState<string>('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [coords, setCoords] = useState<{
    top: number
    bottom: number
    left: number
    width: number
  } | null>(null)
  const [openAbove, setOpenAbove] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const isControlled = value !== undefined
  const currentValue = isControlled ? String(value ?? '') : internalValue

  useDismissibleLayer({
    open,
    triggerRef,
    layerRef: portalRef,
    onDismiss: () => setOpen(false),
    closeOnEscape: true,
  })

  const selectedLabel = options.find((o) => String(o.value) === currentValue)?.label ?? 'בחר...'

  const updateCoords = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    const spaceBelow = window.innerHeight - rect.bottom
    setOpenAbove(spaceBelow < 220)
    setCoords({
      top: rect.bottom,
      bottom: window.innerHeight - rect.top,
      left: rect.left,
      width: rect.width,
    })
  }

  useEffect(() => {
    if (!open) return
    window.addEventListener('scroll', updateCoords, true)
    return () => window.removeEventListener('scroll', updateCoords, true)
  }, [open])

  useEffect(() => {
    if (!open) {
      setHighlightedIndex(-1)
      return
    }

    const selectedIndex = options.findIndex((opt) => !opt.disabled && String(opt.value) === currentValue)
    const firstEnabledIndex = options.findIndex((opt) => !opt.disabled)
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : firstEnabledIndex)
  }, [currentValue, open, options])

  const toggle = () => {
    if (disabled) return
    if (open) {
      setOpen(false)
      return
    }
    updateCoords()
    setOpen(true)
  }

  const moveHighlight = (direction: 1 | -1) => {
    if (options.length === 0) return

    let nextIndex = highlightedIndex
    for (let i = 0; i < options.length; i += 1) {
      nextIndex = (nextIndex + direction + options.length) % options.length
      if (!options[nextIndex]?.disabled) {
        setHighlightedIndex(nextIndex)
        break
      }
    }
  }

  const handleTriggerKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || disabled) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        updateCoords()
        setOpen(true)
        return
      }
      moveHighlight(event.key === 'ArrowDown' ? 1 : -1)
      return
    }

    if ((event.key === 'Enter' || event.key === ' ') && !open) {
      event.preventDefault()
      updateCoords()
      setOpen(true)
      return
    }

    if (event.key === 'Home' && open) {
      event.preventDefault()
      const firstEnabledIndex = options.findIndex((opt) => !opt.disabled)
      setHighlightedIndex(firstEnabledIndex)
      return
    }

    if (event.key === 'End' && open) {
      event.preventDefault()
      const lastEnabledIndex = [...options].reverse().findIndex((opt) => !opt.disabled)
      if (lastEnabledIndex >= 0) setHighlightedIndex(options.length - 1 - lastEnabledIndex)
      return
    }

    if ((event.key === 'Enter' || event.key === ' ') && open) {
      const highlighted = options[highlightedIndex]
      if (!highlighted || highlighted.disabled) return
      event.preventDefault()
      select(highlighted.value)
    }
  }

  const select = (optValue: string) => {
    if (!isControlled) setInternalValue(optValue)
    if (onChange) {
      const syntheticEvent = {
        type: 'change',
        target: { value: optValue, name: name ?? '', type: 'select-one' },
        currentTarget: { value: optValue, name: name ?? '', type: 'select-one' },
      } as React.ChangeEvent<HTMLSelectElement>
      onChange(syntheticEvent)
    }
    setOpen(false)
    if (onBlur) {
      const blurEvent = {
        target: { name: name ?? '', value: optValue },
        currentTarget: { name: name ?? '', value: optValue },
      } as React.FocusEvent<HTMLSelectElement>
      onBlur(blurEvent)
    }
  }

  const triggerClass = cn(
    'flex w-full items-center gap-2 bg-white border rounded-lg transition-colors',
    triggerSizeClasses[size],
    'hover:border-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    open ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-200',
    className,
  )

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        onClick={toggle}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        className={triggerClass}
        dir="rtl"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cn('flex-1 truncate text-right', !currentValue ? 'text-gray-400' : 'text-gray-800')}>
          {selectedLabel}
        </span>
        <ChevronDown className={cn('shrink-0 text-gray-400', iconSizeClasses[size])} />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={portalRef}
            style={{
              position: 'fixed',
              top: openAbove ? undefined : coords.top + 4,
              bottom: openAbove ? coords.bottom + 4 : undefined,
              left: coords.left,
              width: coords.width,
              zIndex: 9999,
            }}
            className="rounded-lg border border-gray-200 bg-white py-1 shadow-lg overflow-auto max-h-60 overscroll-contain"
            role="listbox"
          >
            {options.map((opt, index) => (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disabled}
                onClick={() => select(opt.value)}
                onMouseEnter={() => !opt.disabled && setHighlightedIndex(index)}
                className={cn(
                  'flex w-full items-center gap-2 text-right transition-colors',
                  optionSizeClasses[size],
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                  highlightedIndex === index ? 'bg-primary-50' : 'hover:bg-primary-50',
                  currentValue === String(opt.value) ? 'text-primary-600 font-medium' : 'text-gray-700',
                )}
                role="option"
                aria-selected={currentValue === String(opt.value)}
              >
                <span className="flex-1 truncate">{opt.label}</span>
                {currentValue === String(opt.value) && (
                  <Check className={cn('shrink-0 text-primary-500', iconSizeClasses[size])} />
                )}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}
