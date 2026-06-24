export const ANNUAL_REPORTS_ERROR_MESSAGES = {
  fullPanel: { loadError: 'שגיאה בטעינת הדוח' },
  taxCalculation: { loadError: 'שגיאה בטעינת חישוב מס' },
  amend: { minLength: (minLength: number) => `נדרשים לפחות ${minLength} תווים` },
} as const
