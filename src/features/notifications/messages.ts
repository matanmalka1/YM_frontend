/**
 * Centralized Hebrew UI strings for the notifications feature. Cross-cutting
 * strings stay in GLOBAL_UI_MESSAGES; everything here is notification-domain copy.
 */
export const NOTIFICATIONS_MESSAGES = {
  actions: {
    sendMessage: 'שליחת הודעה',
    sendMessageShort: 'שלח הודעה',
    sendToClient: 'שליחת הודעה ללקוח',
    back: 'חזרה',
    preview: 'תצוגה מקדימה',
    send: 'שלח',
    viewDetails: 'צפייה בפרטים',
  },
  form: {
    title: 'שליחת הודעה',
    generalDomain: 'כללי',
    triggerOptionLabel: (domain: string, triggerLabel: string) => `${domain} — ${triggerLabel}`,
    sendSuccess: 'ההודעה נשלחה בהצלחה',
    typeLabel: 'סוג הודעה',
    subjectLabel: 'נושא',
    bodyLabel: 'תוכן ההודעה',
  },
  tab: {
    title: 'התראות',
    subtitle: 'התראות והודעות שנשלחו ללקוח',
    sent: (count: number) => `נשלחו: ${count}`,
    pending: (count: number) => `בהמתנה: ${count}`,
    loading: 'טוען התראות...',
    emptyClient: 'אין התראות ללקוח זה',
  },
  detail: {
    fallbackTitle: 'הודעה',
    loading: 'טוען את פרטי ההודעה...',
    sectionDetails: 'פרטים',
    type: 'סוג',
    domain: 'תחום',
    client: 'לקוח',
    recipient: 'נמען',
    status: 'סטטוס',
    sectionContent: 'תוכן',
    contentUnavailable: 'תוכן ההודעה לא זמין',
  },
  drawer: {
    title: 'התראות',
    recentVisible: (shown: number, total: number) => `מוצגות ${shown} ההתראות שנשלחו לאחרונה מתוך ${total}`,
    empty: 'אין התראות',
  },
  columns: {
    fallbackTrigger: 'הודעה',
    fallbackDomain: 'כללי',
    date: 'תאריך',
    type: 'סוג',
    client: 'לקוח',
    status: 'סטטוס',
    recipient: 'נמען',
    rowActionsAriaLabel: 'פעולות הודעה',
  },
  listItem: {
    recipient: (recipient: string) => `נשלח ל: ${recipient}`,
  },
  page: {
    filterTitle: 'סינון התראות',
    filterSubtitle: 'לקוח, סוג, סטטוס, תאריך ושולח',
    loading: 'טוען הודעות...',
    title: 'הודעות',
    description: 'מרכז הודעות שנשלחו ונרשמו במערכת',
    empty: 'אין הודעות להצגה',
  },
} as const
