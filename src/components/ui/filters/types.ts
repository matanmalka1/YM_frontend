type FilterKey<TValues> = Extract<keyof TValues, string>

export interface SearchFieldDef<TValues extends Record<string, unknown> = Record<string, unknown>> {
  type: 'search'
  key: FilterKey<TValues>
  label: string
  placeholder?: string
}

interface SelectFieldDef<TValues extends Record<string, unknown> = Record<string, unknown>> {
  type: 'select'
  key: FilterKey<TValues>
  label: string
  options: { value: string; label: string }[]
  /** Treated as "no active filter" for badge purposes. Default: '' */
  defaultValue?: string
  disabled?: boolean
}

interface ToggleFieldDef<TValues extends Record<string, unknown> = Record<string, unknown>> {
  type: 'toggle'
  key: FilterKey<TValues>
  label: string
  /** Multi-select: active values are stored comma-joined in values[key]. */
  options: { value: string; label: string }[]
}

interface DateFieldDef<TValues extends Record<string, unknown> = Record<string, unknown>> {
  type: 'date'
  key: FilterKey<TValues>
  label: string
}

interface DateRangeFieldDef<TValues extends Record<string, unknown> = Record<string, unknown>> {
  type: 'date-range'
  fromKey: FilterKey<TValues>
  toKey: FilterKey<TValues>
  fromLabel: string
  toLabel: string
}

export interface ClientPickerFieldDef<TValues extends Record<string, unknown> = Record<string, unknown>> {
  type: 'client-picker'
  idKey: FilterKey<TValues>
  nameKey?: FilterKey<TValues>
  label?: string
  placeholder?: string
}

export type FilterDefinition<TValues extends Record<string, unknown> = Record<string, unknown>> =
  | SearchFieldDef<TValues>
  | SelectFieldDef<TValues>
  | ToggleFieldDef<TValues>
  | DateFieldDef<TValues>
  | DateRangeFieldDef<TValues>
  | ClientPickerFieldDef<TValues>

export type FilterFieldDef = FilterDefinition<Record<string, unknown>>

export interface SearchFieldHandle {
  reset: () => void
}
