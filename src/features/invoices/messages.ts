/**
 * Centralized Hebrew UI strings for the invoices feature.
 */
export const INVOICES_MESSAGES = {
  section: {
    title: 'חשבונית',
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
  mutations: {
    attached: 'החשבונית צורפה לחיוב',
  },
} as const
