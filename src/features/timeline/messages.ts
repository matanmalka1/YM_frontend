/**
 * Centralized Hebrew UI strings for the timeline feature. Cross-cutting strings
 * (cancel, loading) stay in GLOBAL_UI_MESSAGES;
 * everything here is timeline-domain copy. Grouped by area.
 */
export const TIMELINE_MESSAGES = {
  tab: {
    loadingMessage: 'טוען ציר זמן...',
    paginationLabel: 'אירועים',
  },
  eventItem: {
    amountLabel: 'סכום',
    providerLabel: 'ספק',
    unknownProvider: 'לא ידוע',
    invoiceIdLabel: 'ID חשבונית',
    taxYearLabel: 'שנת מס',
    formLabel: 'טופס',
    statusTransitionLabel: 'מעבר סטטוס',
    noteLabel: 'הערה',
    signerLabel: 'חותם',
    rejectionReasonLabel: 'סיבת דחייה',
    binderLabel: (id: number) => `קלסר #${id}`,
    chargeLabel: (id: number) => `חיוב #${id}`,
  },
  card: {
    emptyFiltered: 'אין אירועים התואמים לסינון',
    clearFilterAction: 'נקה סינון',
    emptyTitle: 'אין אירועים בציר הזמן',
    emptyMessage: 'אירועים חדשים יופיעו כאן לאחר פעילות לקוח',
  },
  filterPanel: {
    subtitle: 'חיפוש וסינון אירועים בציר הזמן',
    eventTypeLabel: 'סוג אירוע',
    importanceLabel: 'חשיבות',
    filterFinance: 'כספים',
    filterBinders: 'קלסרים',
    filterDocuments: 'מסמכים',
    filterTax: 'מיסים',
    filterChanges: 'שינויים',
    dateFromLabel: 'מתאריך',
    dateToLabel: 'עד תאריך',
    eventsCount: (count: string) => `${count} אירועים`,
    lastUpdated: (date: string) => `עודכן לאחרונה: ${date}`,
    importantOnly: 'חשובים בלבד',
  },
} as const
