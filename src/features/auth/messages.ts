/**
 * Centralized Hebrew UI strings for auth screens.
 */
export const AUTH_MESSAGES = {
  common: {
    emailLabel: 'כתובת דוא״ל',
    passwordLabel: 'סיסמה',
    newPasswordLabel: 'סיסמה חדשה',
    confirmPasswordLabel: 'אימות סיסמה',
    sendNewLink: 'שלח קישור חדש',
    backToLogin: 'חזרה להתחברות',
    goToLogin: 'מעבר להתחברות',
  },
  login: {
    mobileLogoLetter: 'ב',
    mobileLogoName: 'יוסף מאיר המלך ',
    heading: 'ברוכים השבים',
    subheading: 'התחברו לחשבון הניהול שלכם כדי להמשיך',
    forgotPassword: 'שכחתי סיסמה',
    checkingCredentials: 'בודקים את פרטי ההתחברות...',
    loading: 'מתחברים...',
    submit: 'כניסה למערכת',
    internalOnly: 'מערכת פנים ארגונית בלבד — גישה מורשית בלבד',
    brandName: 'יוסף מאיר יועץ מס ',
    systemName: 'מערכת ניהול',
    headlineLead: 'ניהול לקוחות,',
    headlineMiddle: 'קלסרים חיובים ודוחות',
    headlineEnd: 'במקום אחד',
    description: 'פלטפורמת הניהול הפנים ארגונית של יוסף מאיר מרוכזת, מאובטחת, ויעילה.',
    featurePills: ['לקוחות', 'קלסרים', 'חיובים', 'מסמכים', 'דוחות מס'],
    legal: (year: number) => `© ${year} יוסף מאיר — כל הזכויות שמורות`,
  },
  forgotPassword: {
    title: 'שכחתי סיסמה',
    description: 'הזן את כתובת הדוא״ל שלך ונשלח קישור מאובטח לאיפוס הסיסמה אם החשבון קיים.',
    loading: 'שולחים...',
    submit: 'שליחת קישור איפוס',
  },
  resetPassword: {
    title: 'איפוס סיסמה',
    description: 'בחר סיסמה חדשה. הסיסמה חייבת לכלול אות גדולה, אות קטנה ותו מיוחד.',
    loading: 'מאפסים...',
    submit: 'שמירת סיסמה חדשה',
  },
} as const
