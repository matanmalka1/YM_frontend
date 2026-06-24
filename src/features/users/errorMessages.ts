export const USERS_ERROR_MESSAGES = {
  page: {
    loadError: 'שגיאה בטעינת המשתמשים',
  },
  form: {
    fullNameMin: 'שם מלא חייב להכיל לפחות 2 תווים',
    fullNameMax: 'שם מלא ארוך מדי',
    invalidEmail: 'כתובת אימייל לא תקינה',
    invalidPhone: 'מספר טלפון לא תקין',
    passwordsMismatch: 'הסיסמאות אינן תואמות',
  },
  auditLog: {
    loadError: 'שגיאה בטעינת לוג הביקורת',
  },
  mutations: {
    createError: 'שגיאה ביצירת משתמש',
    updateError: 'שגיאה בעדכון המשתמש',
    statusError: 'שגיאה בשינוי סטטוס המשתמש',
    passwordResetError: 'שגיאה באיפוס הסיסמה',
  },
} as const
