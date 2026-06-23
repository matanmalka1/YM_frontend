import React, { useRef, useCallback } from 'react'
import { Filter } from 'lucide-react'
import { Select } from '@/components/ui/inputs/Select'
import { Button } from '@/components/ui/primitives/Button'
import { DatePicker } from '@/components/ui/inputs/DatePicker'
import { ToolbarContainer } from '@/components/ui/layout/ToolbarContainer'
import { ActiveFilterBadges } from '@/components/ui/table/ActiveFilterBadges'
import type { FilterBadge } from '@/components/ui/table/ActiveFilterBadges'
import { cn } from '@/utils/utils'
import { SearchFilter } from './SearchFilter'
import { ClientPickerFilter } from './ClientPickerFilter'
import { buildFilterBadges } from './filterBadges'
import type { FilterFieldDef, SearchFieldHandle } from './types'

export interface FilterPanelProps {
  fields: FilterFieldDef[]
  values: Readonly<Record<string, string | undefined>>
  onChange: (key: string, value: string) => void
  onMultiChange?: (updates: Record<string, string>) => void
  onReset: () => void
  /** Tailwind grid class. Default flows all fields into one row at xl (stacked/2-col below). */
  gridClass?: string
  /** Extra badge(s) appended to the auto-generated badge list */
  extraBadges?: FilterBadge[]
  /** Optional header title; when set, renders a heading row above the fields. */
  title?: string
  /** Optional header subtitle, shown under the title. */
  subtitle?: string
  /** Optional icon rendered in a chip beside the header title. Defaults to a funnel icon when `title` is set. */
  icon?: React.ReactNode
  /** Input density passed to Select/DatePicker fields. Default: 'sm' (compact) */
  size?: 'sm' | 'md'
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  fields,
  values,
  onChange,
  onMultiChange,
  onReset,
  gridClass = 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-none xl:grid-flow-col xl:auto-cols-fr',
  extraBadges,
  title,
  subtitle,
  icon,
  size = 'sm',
}) => {
  const searchRefs = useRef<Record<string, SearchFieldHandle | null>>({})

  const handleReset = useCallback(() => {
    for (const ref of Object.values(searchRefs.current)) ref?.reset()
    onReset()
  }, [onReset])

  const badges = buildFilterBadges(fields, values, onChange, searchRefs.current)
  const allBadges = extraBadges ? [...badges, ...extraBadges] : badges

  const handleMulti =
    onMultiChange ??
    ((updates: Record<string, string>) => {
      for (const [k, v] of Object.entries(updates)) onChange(k, v)
    })

  return (
    <div className="space-y-3">
      <ToolbarContainer>
        <div className="space-y-3">
          {title ? (
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                {icon ?? <Filter className="h-4 w-4" aria-hidden="true" />}
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight text-gray-900">{title}</p>
                {subtitle ? <p className="mt-0.5 text-2xs leading-tight text-gray-500">{subtitle}</p> : null}
              </div>
            </div>
          ) : null}
          <div className={cn('grid gap-3', gridClass)}>
            {fields.map((field) => {
              if (field.type === 'search') {
                return (
                  <SearchFilter
                    key={field.key}
                    ref={(el) => {
                      searchRefs.current[field.key] = el
                    }}
                    field={field}
                    size={size}
                    externalValue={values[field.key] ?? ''}
                    onChange={onChange}
                  />
                )
              }
              if (field.type === 'select') {
                const v = values[field.key] ?? ''
                const isActive = v !== '' && v !== (field.defaultValue ?? '')
                return (
                  <Select
                    key={field.key}
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
              if (field.type === 'toggle') {
                const raw = values[field.key] ?? ''
                const selected = raw ? raw.split(',') : []
                return (
                  <div key={field.key} className="space-y-1">
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
              if (field.type === 'date') {
                return (
                  <DatePicker
                    key={field.key}
                    label={field.label}
                    compact={size === 'sm'}
                    value={values[field.key] ?? ''}
                    onChange={(v) => onChange(field.key, v)}
                  />
                )
              }
              if (field.type === 'date-range') {
                return (
                  <React.Fragment key={`${field.fromKey}__${field.toKey}`}>
                    <DatePicker
                      label={field.fromLabel}
                      compact={size === 'sm'}
                      value={values[field.fromKey] ?? ''}
                      onChange={(v) => onChange(field.fromKey, v)}
                    />
                    <DatePicker
                      label={field.toLabel}
                      compact={size === 'sm'}
                      value={values[field.toKey] ?? ''}
                      onChange={(v) => onChange(field.toKey, v)}
                    />
                  </React.Fragment>
                )
              }
              if (field.type === 'client-picker') {
                return (
                  <ClientPickerFilter
                    key={field.idKey}
                    field={field}
                    values={values}
                    onMultiChange={handleMulti}
                    size={size}
                  />
                )
              }
              return null
            })}
          </div>
          <ActiveFilterBadges badges={allBadges} onReset={handleReset} />
        </div>
      </ToolbarContainer>
    </div>
  )
}

FilterPanel.displayName = 'FilterPanel'
