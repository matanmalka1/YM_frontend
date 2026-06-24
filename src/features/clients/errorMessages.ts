export const CLIENTS_ERROR_MESSAGES = {
  details: { invalidId: 'מזהה לקוח לא תקין' },
  create: {
    vatExemptCeiling: 'לא ניתן לטעון את תקרת הפטור כרגע',
    impact: 'לא ניתן לטעון את הפרטים כרגע',
  },
  charges: { create: 'שגיאה ביצירת חיוב' },
} as const
