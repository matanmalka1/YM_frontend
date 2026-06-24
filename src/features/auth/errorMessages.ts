export const AUTH_ERROR_MESSAGES = {
  forgotPassword: {
    emptyEmail: 'יש להזין כתובת דוא״ל',
    invalidEmail: 'כתובת דוא״ל אינה תקינה',
    submitError: 'לא ניתן לשלוח קישור איפוס כרגע. נסה שוב.',
  },
  resetPassword: {
    invalidLink: 'קישור איפוס הסיסמה חסר או אינו תקין.',
    confirmRequired: 'יש לאמת את הסיסמה',
    mismatch: 'הסיסמאות אינן תואמות',
    submitError: 'לא ניתן לאפס את הסיסמה כרגע. נסה שוב.',
  },
  validation: {
    emailRequired: 'יש להזין דוא״ל',
    invalidEmail: 'כתובת דוא״ל לא תקינה',
    passwordRequired: 'יש להזין סיסמה',
  },
} as const
