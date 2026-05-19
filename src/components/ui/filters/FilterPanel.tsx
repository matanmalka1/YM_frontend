import { useRef, useCallback } from 'react'
import { Select } from '@/components/ui/inputs/Select'
import { DatePicker } from '@/components/ui/inputs/DatePicker'
import { ToolbarContainer } from '@/components/ui/layout/ToolbarContainer'
import { ActiveFilterBadges } from '@/components/ui/table/ActiveFilterBadges'
import type { FilterBadge } from '@/components/ui/table/ActiveFilterBadges'
import { cn } from '@/utils/utils'
import { SearchFilter } from './SearchFilter'
import { ClientPickerFilter } from './ClientPickerFilter'
import { buildFilterBadges } from './filterBadges'
import type { FilterFieldDef, SearchFieldHandle } from './types'

export type {
  SearchFieldDef,
  SelectFieldDef,
  DateFieldDef,
  DateRangeFieldDef,
  ClientPickerFieldDef,
  FilterFieldDef,
} from './types'

export interface FilterPanelProps {
  fields: FilterFieldDef[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: Record<string, any>
  onChange: (key: string, value: string) => void
  onMultiChange?: (updates: Record<string, string>) => void
  onReset: () => void
  /** Tailwind grid class. Default: 'grid-cols-1 sm:grid-cols-3' */
  gridClass?: string
  /** Extra content rendered above ToolbarContainer (e.g. StatsCard pills) */
  above?: React.ReactNode
  /** Extra badge(s) appended to the auto-generated badge list */
  extraBadges?: FilterBadge[]
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  fields,
  values,
  onChange,
  onMultiChange,
  onReset,
  gridClass = 'grid-cols-1 sm:grid-cols-3',
  above,
  extraBadges,
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
      {above}
      <ToolbarContainer>
        <div className="space-y-3">
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
                    value={v}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    options={field.options}
                    className={cn(isActive && 'border-primary-400 ring-1 ring-primary-200')}
                  />
                )
              }
              if (field.type === 'date') {
                return (
                  <DatePicker
                    key={field.key}
                    label={field.label}
                    value={values[field.key] ?? ''}
                    onChange={(v) => onChange(field.key, v)}
                  />
                )
              }
              if (field.type === 'date-range') {
                return (
                  <>
                    <DatePicker
                      key={field.fromKey}
                      label={field.fromLabel}
                      value={values[field.fromKey] ?? ''}
                      onChange={(v) => onChange(field.fromKey, v)}
                    />
                    <DatePicker
                      key={field.toKey}
                      label={field.toLabel}
                      value={values[field.toKey] ?? ''}
                      onChange={(v) => onChange(field.toKey, v)}
                    />
                  </>
                )
              }
              if (field.type === 'client-picker') {
                return (
                  <ClientPickerFilter
                    key={field.idKey}
                    field={field}
                    values={values}
                    onMultiChange={handleMulti}
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
