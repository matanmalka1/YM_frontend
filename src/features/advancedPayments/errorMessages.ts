export const ADVANCED_PAYMENTS_ERROR_MESSAGES = {
  clientConfig: {
    load: 'טעינת הגדרות המקדמות של הלקוח נכשלה',
  },
  advancePayment: {
    create: 'שגיאה ביצירת מקדמה',
    update: 'שגיאה בעדכון מקדמה',
    delete: 'שגיאה במחיקת מקדמה',
    listLoad: 'שגיאה בטעינת מקדמות',
    detailLoad: 'שגיאה בטעינת מקדמה',
    turnoverRefresh: 'קיבוע המחזור מדוח המע״מ נכשל',
    alreadyExists: 'מקדמה לחודש זה כבר קיימת',
    paidAmountInvalid: 'סכום ששולם חייב להיות מספר תקין שאינו שלילי',
    paymentMethodInvalid: 'שיטת תשלום אינה תקינה',
  },
  generateSchedule: {
    create: 'שגיאה ביצירת לוח מקדמות',
    profileLoad: 'שגיאה בטעינת פרופיל הלקוח',
    missingClient: 'לא נבחר לקוח תקין',
    profileLoading: 'פרופיל הלקוח עדיין נטען',
    missingFrequency: 'לא ניתן ליצור לוח בלי תדירות מקדמות בפרופיל הלקוח',
  },
} as const
