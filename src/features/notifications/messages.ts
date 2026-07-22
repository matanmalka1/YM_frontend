/**
 * Centralized Hebrew UI strings for the notifications feature. Cross-cutting
 * strings stay in GLOBAL_UI_MESSAGES; everything here is notification-domain copy.
 */
export const NOTIFICATIONS_MESSAGES = {
  actions: {
    sendMessage: 'שליחת הודעה',
    sendMessageShort: 'שלח הודעה',
    sendToClient: 'שליחת הודעה ללקוח',
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
    title: 'הודעות',
    subtitle: 'הודעות שנשלחו ללקוח',
    sent: (count: number) => `נשלחו: ${count}`,
    pending: (count: number) => `בהמתנה: ${count}`,
    loading: 'טוען הודעות...',
    emptyClient: 'אין הודעות ללקוח זה',
  },
  detail: {
    fallbackTitle: 'הודעה',
    loading: 'טוען את פרטי ההודעה...',
    type: 'סוג',
    domain: 'תחום',
    recipient: 'נמען',
    sectionContent: 'תוכן',
    contentUnavailable: 'תוכן ההודעה לא זמין',
  },
  drawer: {
    title: 'הודעות',
    recentVisible: (shown: number, total: number) => `מוצגות ${shown} ההודעות שנשלחו לאחרונה מתוך ${total}`,
    empty: 'אין הודעות',
  },
  columns: {
    fallbackTrigger: 'הודעה',
    fallbackDomain: 'כללי',
    type: 'סוג',
    idNumber: 'ת.ז / ח.פ',
    clientNumber: 'מס׳ לקוח',
    recipient: 'נמען',
    rowActionsAriaLabel: 'פעולות הודעה',
  },
  listItem: {
    recipient: (recipient: string) => `נשלח ל: ${recipient}`,
  },
  page: {
    filterTitle: 'סינון הודעות',
    filterSubtitle: 'לקוח, סוג, סטטוס, תאריך ושולח',
    loading: 'טוען הודעות...',
    title: 'הודעות',
    description: 'מרכז הודעות שנשלחו ונרשמו במערכת',
    empty: 'אין הודעות להצגה',
  },
} as const
