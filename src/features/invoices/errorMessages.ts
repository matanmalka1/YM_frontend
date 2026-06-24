export const INVOICES_ERROR_MESSAGES = {
  validation: {
    providerRequired: 'יש להזין ספק חשבונית',
    invoiceIdRequired: 'יש להזין מזהה חשבונית',
    issuedAtRequired: 'יש להזין תאריך הנפקה',
    validIssuedAt: 'יש להזין תאריך הנפקה תקין',
    validUrl: 'יש להזין קישור תקין',
  },
  mutations: {
    attachError: 'שגיאה בצירוף חשבונית',
    loadError: 'שגיאה בטעינת פרטי חשבונית',
  },
} as const
