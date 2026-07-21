import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { format, parse, parseISO, isValid } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '../../../utils/utils'
import { FormField, type FormFieldControlProps } from './FormField'
import { DatePickerCalendar } from './DatePickerCalendar'
import { getOverlayPortalOffset, useOverlayPortalContainer } from '../overlays/OverlayPortalContext'
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
  id?: string
  label?: string
  error?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>
  disabled?: boolean
  name?: string
  maxDate?: Date
  minDate?: Date
  compact?: boolean
  fieldClassName?: string
  usePortal?: boolean
  'aria-describedby'?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

export const DatePicker: React.FC<DatePickerProps> = ({
  id,
  label,
  error,
  value,
  onChange,
  onBlur,
  onKeyDown,
  disabled,
  name,
  maxDate,
  minDate,
  compact = false,
  fieldClassName,
  usePortal = true,
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => {
  const [open, setOpen] = useState(false)
  // Derive the visible-open state instead of force-closing in an effect when `disabled` flips.
  const isOpen = open && !disabled
  const [month, setMonthState] = useState<Date>(new Date())
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const portalContainer = useOverlayPortalContainer()

  const selected = value ? parseValue(value) : undefined

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
      // Seed the visible month as we open — to the selected date, or today (capped at maxDate)
      // when there's no value. Done here instead of syncing from `value` via an effect.
      const base = selected ?? new Date()
      const clamped = maxDate && base > maxDate ? maxDate : minDate && base < minDate ? minDate : base
      setMonthState(clamped)
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
    open: isOpen,
    triggerRef,
    layerRef: containerRef,
    closeOnEscape: true,
    onDismiss: () => {
      setOpen(false)
      onBlur?.()
    },
  })

  useEffect(() => {
    if (!isOpen || !usePortal) return
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
  }, [isOpen, usePortal])

  const portalOffset = getOverlayPortalOffset(portalContainer)

  const calendar = (
    <DatePickerCalendar
      selected={selected}
      month={month}
      onMonthChange={setMonthState}
      onSelect={handleSelect}
      maxDate={maxDate}
      minDate={minDate}
      containerRef={usePortal ? containerRef : undefined}
      className={usePortal ? 'pointer-events-auto fixed z-[9999]' : 'absolute z-50 mt-1 end-0'}
      style={
        usePortal && dropdownPos
          ? {
              top: dropdownPos.top - portalOffset.top,
              left: dropdownPos.left - portalOffset.left,
              transform: 'translateX(-100%)',
            }
          : undefined
      }
    />
  )

  const renderPicker = (controlProps: FormFieldControlProps) => {
    const describedBy = [ariaDescribedBy, controlProps['aria-describedby']].filter(Boolean).join(' ') || undefined

    return (
      <div ref={usePortal ? undefined : containerRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          id={controlProps.id}
          name={name}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-describedby={describedBy}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          onClick={handleOpen}
          onKeyDown={onKeyDown}
          className={cn(
            'w-full flex items-center justify-between rounded-lg border shadow-sm text-sm transition-all bg-white text-right',
            compact ? 'px-2 py-1 h-7 text-xs' : 'h-9 px-3 py-2',
            error ? 'border-negative-500' : 'border-gray-300',
            isOpen && 'border-primary-500 ring-2 ring-primary-500',
            disabled && 'bg-gray-50 cursor-not-allowed text-gray-400',
            !disabled && 'hover:border-gray-400',
          )}
        >
          <span className={cn('flex-1 text-right', !displayValue && 'text-gray-400')}>{displayValue || 'בחר תאריך'}</span>
          <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </button>

        {isOpen && (usePortal && portalContainer ? createPortal(calendar, portalContainer) : calendar)}
      </div>
    )
  }

  return (
    <FormField id={id} label={label} error={error} className={cn('w-full', fieldClassName)}>
      {renderPicker}
    </FormField>
  )
}

DatePicker.displayName = 'DatePicker'
