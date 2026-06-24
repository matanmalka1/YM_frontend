export const TAX_CALENDAR_SETTINGS_ERROR_MESSAGES = {
  validation: {
    required: (label: string) => `${label} היא שדה חובה`,
    invalidYear: (label: string) => `${label} חייבת להיות שנה תקינה`,
    yearRange: (label: string, minYear: number, maxYear: number) => `${label} חייבת להיות בין ${minYear} ל-${maxYear}`,
    invalidRange: 'שנת ההתחלה חייבת להיות קטנה או שווה לשנת הסיום.',
    invalidRangeToLoad: 'יש להזין טווח שנים תקין כדי לטעון תקציר ורשומות יומן מס.',
  },
  load: {
    summary: 'שגיאה בטעינת תקציר יומן המס',
    rules: 'שגיאה בטעינת כללי יומן המס',
    entries: 'שגיאה בטעינת רשומות יומן המס',
  },
} as const
