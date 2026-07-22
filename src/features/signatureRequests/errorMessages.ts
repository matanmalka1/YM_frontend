export const SIGNATURE_REQUESTS_ERROR_MESSAGES = {
  create: { request: 'שגיאה ביצירת ושליחת בקשת חתימה' },
  cancel: { request: 'שגיאה בביטול בקשת חתימה' },
  list: { load: 'שגיאה בטעינת בקשות חתימה' },
  dashboard: { load: 'לא ניתן לטעון בקשות חתימה' },
  validation: {
    client: 'יש לבחור לקוח',
    titleMin: 'הכותרת חייבת להכיל לפחות 3 תווים',
    titleMax: 'הכותרת יכולה להכיל עד 200 תווים',
    descriptionMax: 'התיאור יכול להכיל עד 2,000 תווים',
    signerNameMin: 'שם החותם חייב להכיל לפחות 2 תווים',
    signerNameMax: 'שם החותם יכול להכיל עד 100 תווים',
    email: 'כתובת הדוא"ל אינה תקינה',
  },
} as const
