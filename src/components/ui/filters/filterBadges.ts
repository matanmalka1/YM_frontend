import { formatDate } from '@/utils/utils'
import type { FilterBadge } from '@/components/ui/table/ActiveFilterBadges'
import type { FilterFieldDef, SearchFieldHandle } from './types'

type ValuesMap = Record<string, unknown>
type SearchRefs = Record<string, SearchFieldHandle | null>

export function buildFilterBadges(
  fields: FilterFieldDef[],
  values: ValuesMap,
  onChange: (key: string, value: string) => void,
  searchRefs: SearchRefs,
): FilterBadge[] {
  const badges: FilterBadge[] = []
  for (const field of fields) {
    if (field.type === 'search') {
      const v = values[field.key]
      if (v)
        badges.push({
          key: field.key,
          label: `${field.label}: ${String(v)}`,
          onRemove: () => {
            searchRefs[field.key]?.reset()
            onChange(field.key, '')
          },
        })
    } else if (field.type === 'select') {
      const v = values[field.key]
      const defaultV = field.defaultValue ?? ''
      if (v && v !== defaultV) {
        const label = field.options.find((o) => o.value === v)?.label ?? String(v)
        badges.push({ key: field.key, label, onRemove: () => onChange(field.key, defaultV) })
      }
    } else if (field.type === 'date') {
      const v = values[field.key]
      if (v)
        badges.push({
          key: field.key,
          label: `${field.label}: ${formatDate(v as string)}`,
          onRemove: () => onChange(field.key, ''),
        })
    } else if (field.type === 'date-range') {
      const from = values[field.fromKey]
      const to = values[field.toKey]
      if (from)
        badges.push({
          key: field.fromKey,
          label: `${field.fromLabel}: ${formatDate(from as string)}`,
          onRemove: () => onChange(field.fromKey, ''),
        })
      if (to)
        badges.push({
          key: field.toKey,
          label: `${field.toLabel}: ${formatDate(to as string)}`,
          onRemove: () => onChange(field.toKey, ''),
        })
    } else if (field.type === 'client-picker') {
      const id = values[field.idKey]
      const nameKey = field.nameKey
      const name = nameKey ? values[nameKey] : undefined
      if (id)
        badges.push({
          key: field.idKey,
          label: `לקוח: ${name ?? `#${id}`}`,
          onRemove: () => {
            onChange(field.idKey, '')
            if (nameKey) onChange(nameKey, '')
          },
        })
    }
  }
  return badges
}
