import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Select } from '@/components/ui/inputs/Select'
import { Button } from '@/components/ui/primitives/Button'
import { DatePicker } from '@/components/ui/inputs/DatePicker'
import { ToolbarContainer } from '@/components/ui/layout/ToolbarContainer'
import { cn } from '@/utils/utils'
import { ActiveFilterBadges, type FilterBadge } from './ActiveFilterBadges'
import { SearchFilter } from './SearchFilter'
import { buildFilterBadges } from './filterBadges'
import type { FilterFieldDef } from './types'

type FilterSize = 'xs' | 'sm' | 'md'

export interface FilterPanelProps {
  fields: FilterFieldDef[]
  values: Readonly<Record<string, string | undefined>>
  onChange: (key: string, value: string) => void
  onMultiChange?: (updates: Record<string, string>) => void
  onReset: () => void
  extraBadges?: FilterBadge[]
  title?: string
  subtitle?: string
  icon?: React.ReactNode
}

const FALLBACK_TITLE = 'סינון'
const STACKED_GRID = 'grid-cols-1 sm:grid-cols-2'

/**
 * Closes the panel on outside click / Escape while it is open.
 *
 * Inside-ness is detected purely via the React tree, not DOM geometry: every interaction
 * inside the panel — the trigger button, the fields, and the field menus that Select/
 * DatePicker portal out to `document.body` — bubbles through the wrapper's
 * `onPointerDownCapture` (returned as `markInside`), which sets `insideRef` before the
 * document-level `pointerdown` handler runs. A geometric `contains` check is avoided on
 * purpose: the wrapper is full-width (`flex justify-end`), so its empty band would read as
 * "inside", and portal'd menus would read as "outside".
 *
 * The flag is only set while the panel is `active`, so the click that opens the panel does
 * not leave a stale `insideRef` that would swallow the first outside click afterwards.
 *
 * Returns the capture handler to spread on the wrapper element.
 */
const useDismiss = (active: boolean, close: () => void) => {
  const insideRef = useRef(false)
  useEffect(() => {
    if (!active) return
    insideRef.current = false
    const onPointer = () => {
      if (insideRef.current) {
        insideRef.current = false
        return
      }
      close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [active, close])
  return useCallback(() => {
    if (active) insideRef.current = true
  }, [active])
}

interface FilterFieldProps {
  field: FilterFieldDef
  values: Readonly<Record<string, string | undefined>>
  size: FilterSize
  onChange: (key: string, value: string) => void
  onMultiChange: (updates: Record<string, string>) => void
}

const FilterField: React.FC<FilterFieldProps> = ({ field, values, size, onChange, onMultiChange }) => {
  switch (field.type) {
    case 'search':
      return (
        <SearchFilter
          field={field}
          size={size}
          externalValue={values[field.key] ?? ''}
          onChange={onChange}
          fieldClassName={cn(field.fullWidth && 'sm:col-span-2')}
        />
      )
    case 'select': {
      const v = values[field.key] ?? ''
      const isActive = v !== '' && v !== (field.defaultValue ?? '')
      return (
        <Select
          label={field.label}
          size={size}
          value={v}
          onChange={(e) => onChange(field.key, e.target.value)}
          options={field.options}
          disabled={field.disabled}
          className={cn(isActive && 'border-primary-400 ring-1 ring-primary-200')}
        />
      )
    }
    case 'toggle': {
      const raw = values[field.key] ?? ''
      const selected = raw ? raw.split(',') : []
      return (
        <div className={cn('space-y-1', field.fullWidth && 'sm:col-span-2')}>
          <span className="block text-sm font-medium text-gray-700">{field.label}</span>
          <div className="flex flex-wrap gap-1.5">
            {field.options.map((opt) => {
              const isOn = selected.includes(opt.value)
              return (
                <Button
                  key={opt.value}
                  type="button"
                  size="sm"
                  variant={isOn ? 'primary' : 'outline'}
                  onClick={() => {
                    const next = isOn ? selected.filter((v) => v !== opt.value) : [...selected, opt.value]
                    onChange(field.key, next.join(','))
                  }}
                >
                  {opt.label}
                </Button>
              )
            })}
          </div>
        </div>
      )
    }
    case 'date':
      return (
        <DatePicker
          label={field.label}
          compact={size !== 'md'}
          value={values[field.key] ?? ''}
          onChange={(v) => onChange(field.key, v)}
        />
      )
    case 'date-range':
      return (
        <>
          <DatePicker
            label={field.fromLabel}
            compact={size !== 'md'}
            value={values[field.fromKey] ?? ''}
            onChange={(v) => onChange(field.fromKey, v)}
          />
          <DatePicker
            label={field.toLabel}
            compact={size !== 'md'}
            value={values[field.toKey] ?? ''}
            onChange={(v) => onChange(field.toKey, v)}
          />
        </>
      )
    case 'custom':
      return field.render({ values, onMultiChange, size: size === 'md' ? 'md' : 'sm' })
    default:
      return null
  }
}

const fieldKey = (field: FilterFieldDef): string => {
  if (field.type === 'date-range') return `${field.fromKey}__${field.toKey}`
  return field.key
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  fields,
  values,
  onChange,
  onMultiChange,
  onReset,
  extraBadges,
  title,
  subtitle,
  icon,
}) => {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  const close = useCallback(() => setOpen(false), [])
  const markInside = useDismiss(open, close)

  const handleMulti = useCallback(
    (updates: Record<string, string>) => {
      if (onMultiChange) return onMultiChange(updates)
      for (const [k, v] of Object.entries(updates)) onChange(k, v)
    },
    [onMultiChange, onChange],
  )

  const badges = buildFilterBadges(fields, values, onChange, handleMulti)
  const allBadges = extraBadges ? [...badges, ...extraBadges] : badges

  return (
    <div onPointerDownCapture={markInside} className="relative flex justify-end">
      <Button
        type="button"
        variant="outline"
        size="sm"
        icon={icon ?? <Filter className="h-4 w-4" aria-hidden="true" />}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={title ?? FALLBACK_TITLE}
        onClick={() => setOpen((v) => !v)}
      >
        {title ?? FALLBACK_TITLE}
        {allBadges.length > 0 ? (
          <span className="ms-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-2xs font-semibold text-white">
            {allBadges.length}
          </span>
        ) : null}
      </Button>
      {open ? (
        <div
          id={panelId}
          role="region"
          aria-label={title ?? FALLBACK_TITLE}
          className="absolute end-0 top-full z-30 mt-2 w-[min(34rem,calc(100vw-2rem))]"
        >
          <ToolbarContainer className="shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div>
                  <p className="text-sm font-semibold leading-tight text-gray-900">{title ?? FALLBACK_TITLE}</p>
                  {subtitle ? <p className="mt-0.5 text-2xs leading-tight text-gray-500">{subtitle}</p> : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={<X className="h-4 w-4" aria-hidden="true" />}
                  aria-label="סגור"
                  onClick={close}
                />
              </div>
              <div className={cn('grid gap-2.5', STACKED_GRID)}>
                {fields.map((field) => (
                  <FilterField
                    key={fieldKey(field)}
                    field={field}
                    values={values}
                    size="sm"
                    onChange={onChange}
                    onMultiChange={handleMulti}
                  />
                ))}
              </div>
              <ActiveFilterBadges badges={allBadges} onReset={onReset} withDivider />
            </div>
          </ToolbarContainer>
        </div>
      ) : null}
    </div>
  )
}

FilterPanel.displayName = 'FilterPanel'
