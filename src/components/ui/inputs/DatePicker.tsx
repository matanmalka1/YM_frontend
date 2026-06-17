import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { format, parse, parseISO, isValid } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '../../../utils/utils'
import { FormField } from './FormField'
import { DatePickerCalendar } from './DatePickerCalendar'
import { useDismissibleLayer } from '../overlays/useDismissibleLayer'

/** Approx. rendered calendar size; used only before the calendar mounts (real size is measured after). */
const ESTIMATED_CALENDAR_HEIGHT = 340
const ESTIMATED_CALENDAR_WIDTH = 300

/** Tolerant parse: accept date-only (yyyy-MM-dd) and fall back to full ISO so a datetime value still displays. */
const parseValue = (raw: string): Date | undefined => {
  const d = parse(raw, 'yyyy-MM-dd', new Date())
  if (isValid(d)) return d
  const iso = parseISO(raw)
  return isValid(iso) ? iso : undefined
}

export interface DatePickerProps {
  label?: string
  error?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>
  disabled?: boolean
  name?: string
  maxDate?: Date
  compact?: boolean
  noWrapper?: boolean
  usePortal?: boolean
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  error,
  value,
  onChange,
  onBlur,
  onKeyDown,
  disabled,
  maxDate,
  compact = false,
  noWrapper = false,
  usePortal = true,
}) => {
  const [open, setOpen] = useState(false)
  const [month, setMonthState] = useState<Date>(new Date())
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const selected = value ? parseValue(value) : undefined

  useEffect(() => {
    if (selected) setMonthState(selected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const displayValue = selected ? format(selected, 'dd/MM/yyyy') : ''

  const computeDropdownPos = () => {
    if (!triggerRef.current) return null
    const rect = triggerRef.current.getBoundingClientRect()
    // Prefer the real mounted size; fall back to estimates before the first paint.
    const calHeight = containerRef.current?.offsetHeight || ESTIMATED_CALENDAR_HEIGHT
    const calWidth = containerRef.current?.offsetWidth || ESTIMATED_CALENDAR_WIDTH
    // Flip above the trigger when there isn't room for the calendar below it
    // (e.g. a date field near the bottom of a drawer/viewport).
    const spaceBelow = window.innerHeight - rect.bottom
    const openUp = spaceBelow < calHeight + 8
    const top = openUp ? Math.max(rect.top - calHeight - 4, 8) : rect.bottom + 4
    // The calendar is right-aligned to the trigger (translateX(-100%)), so it spans
    // [left - calWidth, left]. Clamp horizontally so it stays inside the viewport.
    const left = Math.min(Math.max(rect.right, calWidth + 8), window.innerWidth - 8)
    return { top, left }
  }

  const handleOpen = () => {
    if (disabled) return
    if (!open) {
      // Reopening with no value: default the visible month to today (capped at maxDate),
      // not a stale month captured at mount.
      if (!selected) {
        const today = new Date()
        setMonthState(maxDate && today > maxDate ? maxDate : today)
      }
      if (usePortal) {
        const pos = computeDropdownPos()
        if (pos) setDropdownPos(pos)
      }
    }
    setOpen((o) => !o)
  }

  const handleSelect = (day: Date | undefined) => {
    onChange?.(day ? format(day, 'yyyy-MM-dd') : '')
    setOpen(false)
    onBlur?.()
  }

  useDismissibleLayer({
    open,
    triggerRef,
    layerRef: containerRef,
    closeOnEscape: true,
    onDismiss: () => {
      setOpen(false)
      onBlur?.()
    },
  })

  // Close if the field is disabled while the calendar is open.
  useEffect(() => {
    if (disabled && open) setOpen(false)
  }, [disabled, open])

  useEffect(() => {
    if (!open || !usePortal) return
    const updatePos = () => {
      const pos = computeDropdownPos()
      if (pos) setDropdownPos(pos)
    }
    // Recompute once the calendar has mounted so we use its measured size, then track scroll/resize.
    updatePos()
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => {
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [open, usePortal])

  const calendar = (
    <DatePickerCalendar
      selected={selected}
      month={month}
      onMonthChange={setMonthState}
      onSelect={handleSelect}
      maxDate={maxDate}
      containerRef={usePortal ? containerRef : undefined}
      className={usePortal ? 'fixed z-[9999]' : 'absolute z-50 mt-1 end-0'}
      style={
        usePortal && dropdownPos
          ? { top: dropdownPos.top, left: dropdownPos.left, transform: 'translateX(-100%)' }
          : undefined
      }
    />
  )

  const picker = (
    <div ref={usePortal ? undefined : containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={handleOpen}
        onKeyDown={onKeyDown}
        className={cn(
          'w-full flex items-center justify-between rounded-lg border shadow-sm text-sm transition-all bg-white text-right',
          compact ? 'px-2 py-1 h-7 text-xs' : 'h-9 px-3 py-2',
          error ? 'border-negative-500' : 'border-gray-300',
          open && 'border-primary-500 ring-2 ring-primary-500',
          disabled && 'bg-gray-50 cursor-not-allowed text-gray-400',
          !disabled && 'hover:border-gray-400',
        )}
      >
        <span className={cn('flex-1 text-right', !displayValue && 'text-gray-400')}>{displayValue || 'בחר תאריך'}</span>
        <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </button>

      {open && (usePortal ? createPortal(calendar, document.body) : calendar)}
    </div>
  )

  if (noWrapper) return picker
  return (
    <FormField label={label} error={error} className="w-full">
      {picker}
    </FormField>
  )
}

DatePicker.displayName = 'DatePicker'
