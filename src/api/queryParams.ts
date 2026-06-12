type QueryPrimitive = string | number | boolean | null | undefined
type QueryValue = QueryPrimitive | QueryPrimitive[]

const shouldSkipValue = (value: QueryValue): boolean => {
  if (Array.isArray(value)) return value.length === 0
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  return false
}

export const toQueryParams = <T extends object>(input: T): URLSearchParams => {
  const params = new URLSearchParams()

  Object.entries(input as Record<string, QueryValue>).forEach(([key, value]) => {
    if (shouldSkipValue(value)) return
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === null || item === undefined) return
        if (typeof item === 'string' && item.trim().length === 0) return
        params.append(key, String(item))
      })
      return
    }
    params.set(key, String(value))
  })

  return params
}
