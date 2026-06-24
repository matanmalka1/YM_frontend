/**
 * Centralized Hebrew UI strings for the dashboard feature. Cross-cutting strings
 * (cancel and common actions) stay in GLOBAL_UI_MESSAGES; everything here is
 * dashboard-domain copy. Grouped by the area that renders it.
 */
export const DASHBOARD_MESSAGES = {
  stats: {
    completed: 'הושלמו',
    pendingReports: 'דוחות ממתינים',
    advancesDue: 'מקדמות לתשלום',
  },
  attention: {
    overdue: 'באיחור',
    approaching: 'מתקרב',
    important: 'חשוב',
    upcoming: 'קרוב',
    vat: 'מע״מ',
    charge: 'חיוב',
    advancePayment: 'מקדמה',
    annualReport: 'דוח שנתי',
    binder: 'קלסר',
    task: 'משימה',
    general: 'כללי',
    prioritySummary: (total: number, displayed: number) => `${total} פריטים פתוחים · ${displayed} בראש סדר העדיפויות`,
    showAll: 'הצג הכל',
  },
  openCharges: {
    title: 'חיובים פתוחים',
    pendingCollection: (count: string) => `${count} חיובים ממתינים לגבייה`,
    openAll: 'פתח את כל החיובים',
  },
  quickActions: {
    title: 'פעולות מהירות',
  },
  recentActivity: {
    title: 'פעילות אחרונה',
    subtitle: 'עדכוני המשרד מהיומיים האחרונים',
    empty: 'אין פעילות אחרונה',
  },
  season: {
    completed: 'הושלמו',
    noReports: 'אין דוחות שנתיים לעונה הנוכחית',
    submitted: 'הוגשו',
    closed: 'נסגרו',
    inProgress: 'בתהליך',
    notStarted: 'טרם החלו',
    reportsInSeason: (count: string) => `${count} דוחות בעונה`,
    overdue: (count: number) => `${count} באיחור`,
    pending: 'ממתינים',
    total: (count: string) => `${count} בסך הכל`,
    annualReports: 'דוחות שנתיים',
    previousSlideAriaLabel: 'שקף קודם',
    nextSlideAriaLabel: 'שקף הבא',
  },
  deadlines: {
    bimonthly: 'דו-חודשי',
    monthly: 'חודשי',
    payments: 'תשלומים',
    reports: 'דוחות',
    title: 'מועדי מס קרובים',
    emptyTitle: 'אין מועדים קרובים',
    emptyDescription: 'כל המועדים הפתוחים רחוקים יותר או הושלמו',
    viewAll: 'צפה בכל מועדי המס',
  },
  modals: {
    chooseAdvancePaymentClient: 'מקדמה חדשה — בחר לקוח',
  },
} as const
