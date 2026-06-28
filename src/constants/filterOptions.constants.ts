export const getResultTypeLabel = (resultType: string) => {
  if (resultType === 'binder') return 'קלסר'
  if (resultType === 'client') return 'לקוח'
  return '—'
}

export const ALL_STATUSES_OPTION = { value: '', label: 'כל הסטטוסים' } as const
export const ALL_TYPES_OPTION = { value: '', label: 'כל הסוגים' } as const
export const ALL_MONTHS_OPTION = { value: '', label: 'כל החודשים' } as const
export const ALL_YEARS_URL_OPTION = { value: 'all', label: 'כל השנים' } as const
export const ALL_CATEGORIES_OPTION = { value: '', label: 'כל הקטגוריות' } as const
export const ALL_PERIODS_OPTION = { value: '', label: 'כל התקופות' } as const
