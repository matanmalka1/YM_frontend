export const CLIENTS_ERROR_MESSAGES = {
  details: { invalidId: 'מזהה לקוח לא תקין' },
  create: {
    vatExemptCeiling: 'לא ניתן לטעון את תקרת הפטור כרגע',
    impact: 'לא ניתן לטעון את הפרטים כרגע',
  },
  charges: { create: 'שגיאה ביצירת חיוב' },
  client: { restore: 'שגיאה בשחזור לקוח', create: 'שגיאה ביצירת לקוח', listLoad: 'שגיאה בטעינת רשימת לקוחות', update: 'שגיאה בעדכון לקוח', detailLoad: 'שגיאה בטעינת פרטי לקוח', detailsUpdate: 'שגיאה בעדכון פרטי לקוח', delete: 'שגיאה במחיקת לקוח' },
  business: { update: 'שגיאה בעדכון עסק', delete: 'שגיאה במחיקת עסק', create: 'שגיאה ביצירת עסק' },
} as const
