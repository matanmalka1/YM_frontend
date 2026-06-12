type LookupMap = Record<string, string>

export const makeLabelGetter = (map: LookupMap, fallback = '—') => {
  return (key: string) => map[key] ?? fallback
}
