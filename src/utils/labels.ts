import type { BadgeVariant } from '@/components/ui/primitives/Badge'

type LookupMap = Record<string, string>

export const makeLabelGetter = (map: LookupMap, fallback = '—') => {
  return (key: string) => map[key] ?? fallback
}

export const makeVariantGetter = <T extends string>(
  map: Record<T, BadgeVariant>,
  fallback: BadgeVariant = 'neutral',
) => {
  return (key: string): BadgeVariant => map[key as T] ?? fallback
}
