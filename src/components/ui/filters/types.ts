export interface SearchFieldDef {
  type: 'search'
  key: string
  label: string
  placeholder?: string
}

interface SelectFieldDef {
  type: 'select'
  key: string
  label: string
  options: { value: string; label: string }[]
  /** Treated as "no active filter" for badge purposes. Default: '' */
  defaultValue?: string
}

interface DateFieldDef {
  type: 'date'
  key: string
  label: string
}

interface DateRangeFieldDef {
  type: 'date-range'
  fromKey: string
  toKey: string
  fromLabel: string
  toLabel: string
}

export interface ClientPickerFieldDef {
  type: 'client-picker'
  idKey: string
  nameKey?: string
  label?: string
  placeholder?: string
}

export type FilterFieldDef = SearchFieldDef | SelectFieldDef | DateFieldDef | DateRangeFieldDef | ClientPickerFieldDef

export interface SearchFieldHandle {
  reset: () => void
}
