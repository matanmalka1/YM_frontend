/**
 * Centralized Hebrew UI strings for the invoices feature.
 */
export const INVOICES_MESSAGES = {
  section: {
    title: 'חשבונית',
    status: 'סטטוס',
    loadingDetails: 'טוען פרטי חשבונית...',
    provider: 'ספק',
    externalId: 'מזהה חיצוני',
    issuedAt: 'הונפקה',
    attachedAt: 'צורפה',
    document: 'מסמך',
    openDocument: 'פתח מסמך',
    noInvoice: 'לא צורפה חשבונית לחיוב זה.',
    attachIssuedOnly: 'ניתן לצרף חשבונית רק לחיוב שהונפק.',
    attachInvoice: 'צרף חשבונית',
    providerRequired: 'ספק *',
    invoiceIdRequired: 'מזהה חשבונית *',
    issuedAtRequired: 'תאריך הנפקה *',
    documentUrl: 'קישור למסמך',
    save: 'שמור חשבונית',
  },
  validation: {
    providerRequired: 'יש להזין ספק חשבונית',
    invoiceIdRequired: 'יש להזין מזהה חשבונית',
    issuedAtRequired: 'יש להזין תאריך הנפקה',
    validIssuedAt: 'יש להזין תאריך הנפקה תקין',
    validUrl: 'יש להזין קישור תקין',
  },
  mutations: {
    attached: 'החשבונית צורפה לחיוב',
    attachError: 'שגיאה בצירוף חשבונית',
    loadError: 'שגיאה בטעינת פרטי חשבונית',
  },
} as const
