/**
 * Centralized Hebrew UI strings for the businesses feature. Business status
 * labels stay in constants as semantic enum labels.
 */
export const BUSINESSES_MESSAGES = {
  details: {
    title: 'פרטי עסק',
    invalidId: 'מזהה לא תקין',
    loading: 'טוען פרטי עסק...',
    clientsListLabel: 'לקוחות',
    clientFallback: 'לקוח',
    sectionTitle: 'פרטי פעילות',
    systemIdLabel: 'מזהה מערכת',
    clientLabel: 'לקוח',
    businessNameLabel: 'שם עסק',
    statusLabel: 'סטטוס',
    openedAtLabel: 'נפתח בתאריך',
    closedAtLabel: 'נסגר בתאריך',
    createdAtLabel: 'נוצר בתאריך',
    emptyValue: '—',
    auditTitle: 'יומן שינויים',
    auditSubtitle: 'שינויים שבוצעו בפרטי העסק',
    clientLoadError: 'שגיאה בטעינת פרטי לקוח',
    businessLoadError: 'שגיאה בטעינת פרטי עסק',
    wrongClientError: 'העסק אינו שייך ללקוח שנבחר',
  },
} as const
