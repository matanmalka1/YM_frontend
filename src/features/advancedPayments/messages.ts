/**
 * Centralized Hebrew UI strings for the advancedPayments feature. Cross-cutting
 * strings (cancel, loading, generic actions) stay in GLOBAL_UI_MESSAGES;
 * everything here is advancedPayments-domain copy. Grouped by the area that renders it.
 */
import { formatDateTime } from '@/utils/utils'
import type { AvailableTurnover, BulkRefreshTurnoverResponse, TurnoverSource } from './api/contracts'

const TURNOVER_SOURCE_LABELS: Record<TurnoverSource, string> = {
  manual: 'הוזן ידנית',
  vat_filed: 'מקובע מדוח מע״מ מוגש',
  vat_pending: 'מקובע מדוח מע״מ שטרם הוגש',
}

/** Same distinction, short enough to sit inside a list value. */
const TURNOVER_SOURCE_SHORT_LABELS: Record<TurnoverSource, string> = {
  manual: 'מוזן ידנית',
  vat_filed: 'ממע״מ',
  vat_pending: 'ממע״מ בהכנה',
}

/** What a period could be snapshotted from, before anyone pressed the button. */
const AVAILABLE_TURNOVER_LABELS: Record<AvailableTurnover['source'], string> = {
  vat_filed: 'דוח מע״מ הוגש',
  vat_pending: 'דוח מע״מ בהכנה',
}

export const ADVANCED_PAYMENTS_MESSAGES = {
  turnoverRefresh: {
    success: 'המחזור קובע מדוח המע״מ',
    provenance: (source: TurnoverSource, snapshotAt: string | null): string =>
      snapshotAt ? `${TURNOVER_SOURCE_LABELS[source]} · ${formatDateTime(snapshotAt)}` : TURNOVER_SOURCE_LABELS[source],
    confirmTitle: 'דוח המע״מ טרם הוגש',
    confirmMessage:
      'המחזור לתקופה זו מגיע מדוח מע״מ שטרם הוגש, והוא עשוי להשתנות. הקיבוע יישאר על הסכום הנוכחי גם אם הדוח ישתנה.',
    confirmLabel: 'קבע בכל זאת',
    /** Reads as an offer, not as the period's turnover. */
    available: (source: AvailableTurnover['source'], amount: string) => `${AVAILABLE_TURNOVER_LABELS[source]} · ${amount}`,
    availableBadge: 'ניתן לקיבוע',
    /** Field label that names the provenance of a held turnover. */
    turnoverLabel: (source: TurnoverSource) => `מחזור (${TURNOVER_SOURCE_SHORT_LABELS[source]})`,
    bulkAvailable: (count: number) => `ל-${count} מקדמות יש דוח מע״מ מוגש שטרם קובע`,
    bulkButton: (count: number) => `קבע מחזור ל-${count} מקדמות`,
    /** Skips are reported by reason: each one calls for a different follow-up. */
    bulkResult: ({ refreshed, skipped_no_vat, skipped_not_filed, skipped_paid }: BulkRefreshTurnoverResponse) =>
      [
        `${refreshed} מקדמות קובעו`,
        skipped_no_vat > 0 ? `${skipped_no_vat} ללא דוח מע״מ` : null,
        skipped_not_filed > 0 ? `${skipped_not_filed} ממתינות להגשת הדוח` : null,
        skipped_paid > 0 ? `${skipped_paid} כבר שולמו` : null,
      ]
        .filter(Boolean)
        .join(' · '),
  },
  readonlySections: {
    sectionTitle: 'פרטי תשלום',
    paidAmountLabel: 'סכום שולם',
    expectedAmountLabel: 'סכום צפוי',
    advanceRateLabel: 'אחוז מקדמה',
    calculatedAmountLabel: 'סכום מחושב',
    overrideAmountLabel: 'סכום עקיפה',
    paymentMethodLabel: 'שיטת תשלום',
    paidAtLabel: 'תאריך ביצוע',
  },
  detailActions: {
    deleteAriaLabel: 'מחק מקדמה',
    deleteTitle: 'מחק מקדמה',
    deleteModalTitle: 'מחיקת מקדמה',
    deleteModalMessage: 'האם למחוק מקדמה זו?',
    deleteConfirm: 'כן, מחק',
  },
  detail: {
    fallbackTitle: 'מקדמה',
    expectedStatTitle: 'סכום צפוי',
    paidStatTitle: 'שולם',
    balanceStatTitle: 'יתרה לתשלום',
    turnoverStatTitle: 'מחזור לתקופה',
    contextSectionTitle: 'פרטי לקוח ותקופה',
    paidLateLabel: 'שולם באיחור',
    overdueLabel: 'באיחור',
    idNumberLabel: 'ת.ז / ח.פ',
    advanceRateLabel: 'שיעור מקדמה',
    turnoverWithSource: (amount: string, source: TurnoverSource) => `${amount} (${TURNOVER_SOURCE_SHORT_LABELS[source]})`,
    title: (period: string) => `מקדמה - ${period}`,
    clientNumberPrefix: (num: number) => `מס׳ לקוח ${num}`,
    missingTurnoverAlert: 'חסר מחזור לתקופה — לא ניתן לחשב מקדמה מדויקת',
    periodSectionTitle: 'פרטי תקופה',
    dueDateLabel: 'תאריך יעד',
    periodTurnoverLabel: 'מחזור לתקופה',
    noVatReportNote: 'אין דוח מע״מ לתקופה',
    timingStatusLabel: 'סטטוס עמידה',
  },
  editableSections: {
    calculationSectionTitle: 'חישוב מקדמה',
    periodTurnoverLabel: 'מחזור לתקופה',
    refreshTurnoverButton: 'קבע לפי מע״מ',
    vatPendingAlert: 'מבוסס על דוח מע״מ שטרם הוגש',
    calculatedAmountLabel: 'סכום מחושב',
    overrideAmountLabel: 'סכום עקיפה (אופציונלי)',
    finalAmountLabel: 'סכום סופי',
    paymentSectionTitle: 'עדכון תשלום',
    paidAmountLabel: 'סכום שולם',
    paymentMethodLabel: 'שיטת תשלום',
    noMethodOption: 'ללא',
    paidAtLabel: 'תאריך ביצוע תשלום',
    notesPlaceholder: 'הערות...',
  },
  batchColumns: {
    officeNumberHeader: 'מס׳',
    clientNameHeader: 'שם לקוח',
    missingTurnoverBadge: 'חסר מחזור',
    periodHeader: 'תקופת מקדמה',
    dueDateHeader: 'תאריך יעד',
    turnoverHeader: 'מחזור מדווח',
    expectedHeader: 'צפוי',
    paidHeader: 'שולם',
    balanceHeader: 'יתרה',
    advanceRateHeader: 'אחוז מקדמה',
    rowActionsAriaLabel: (id: number) => `פעולות למקדמה ${id}`,
    updatePaymentAction: 'עדכן תשלום',
    goToClientAction: 'עבור ללקוח',
  },
  batchContent: {
    paginationLabel: 'מקדמות',
  },
  batchRow: {
    typeLabel: 'מקדמות',
    dueDatePrefix: 'לתשלום עד',
    ctaLabel: 'פתח לקוחות',
    pendingLabel: 'ממתינים',
    paidLabel: 'שולם',
    unpaidLabel: 'לא שולם',
    overdueLabel: 'באיחור',
    missingTurnoverLabel: 'חסרי מחזור',
  },
  batchesList: {
    emptyNoYear: 'אין מקדמות',
    emptyWithYear: (year: number) => `אין מקדמות לשנה ${year}`,
  },
  generateScheduleModal: {
    title: 'צור לוח מקדמות שנתי',
    createButton: 'צור לוח',
    loadingProfile: 'טוען פרופיל לקוח...',
    scheduleNote: 'ייווצרו רק מקדמות שתאריך היעד שלהן מהיום והלאה',
  },
  frequency: {
    prefix: 'תדירות מקדמות:',
    unset: 'תדירות מקדמות לא הוגדרה',
  },
  createModal: {
    title: 'מקדמה חדשה',
    createButton: 'יצירה',
    monthLabel: 'חודש',
    frequencyLabel: 'תדירות מקדמות',
    turnoverLabel: 'מחזור לתקופה (אופציונלי)',
    advanceRateLabel: 'אחוז מקדמה (%) (אופציונלי)',
    calculatedAmountLabel: 'סכום מחושב',
    overrideAmountLabel: 'סכום עקיפה (אופציונלי)',
    paidAmountLabel: 'סכום ששולם (אופציונלי)',
    notesLabel: 'הערות (אופציונלי)',
    notesPlaceholder: 'הערות...',
  },
  createFlow: {
    selectClientTitle: 'הוסף מקדמה — בחר לקוח',
  },
  page: {
    createYearlySchedule: 'צור לוח שנתי',
    addPayment: 'הוסף מקדמה',
    filterTitle: 'סינון מקדמות',
    filterSubtitle: 'לקוח, שנה, סטטוס ותקופה',
  },
  clientTab: {
    title: 'מקדמות',
    subtitle: 'מקדמות המס המקושרות ללקוח זה',
    yearFilterLabel: 'שנה',
    paginationLabel: 'מקדמות',
  },
  clientCards: {
    empty: 'אין מקדמות להצגה',
    missingTurnoverLabel: 'חסר מחזור',
    dueDateLabel: 'לתשלום עד',
    paidAtLabel: 'שולם ב',
    paidLabel: 'שולם',
    balanceLabel: 'יתרה',
    expectedLabel: 'צפוי לתשלום',
    paidLate: 'שולם באיחור',
    overdue: 'באיחור',
    viewDetails: 'צפה בפרטים',
    updatePayment: 'עדכן תשלום',
  },
  clientHeader: {
    addPayment: 'הוסף מקדמה',
    createYearlySchedule: 'צור לוח שנתי',
    loadingLabel: 'יוצר...',
    noFrequencyTooltip: 'לא ניתן ליצור לוח בלי תדירות מקדמות בפרופיל הלקוח',
    confirmTitle: 'יצירת לוח מקדמות',
    confirmButton: 'צור',
    advanceRateNote: (rate: number) => `אחוז מקדמות: ${rate}%`,
    confirmMessage: (frequencyLabel: string, year: number) =>
      `ליצור מקדמות ${frequencyLabel} לשנת ${year}? ייווצרו רק מקדמות שתאריך היעד שלהן מהיום והלאה. מקדמות קיימות לא יושפעו.`,
  },
  clientStats: {
    totalExpectedTitle: 'סה״כ צפוי',
    totalPaidTitle: 'סה״כ שולם',
    collectionRateTitle: 'שיעור גבייה',
    overdueTitle: 'פיגורים',
  },
  stats: {
    dueThisMonthTitle: 'לתשלום החודש',
    dueThisMonthDescription: 'מקדמות לתקופה הנוכחית',
    pendingTitle: 'לקוחות ממתינים',
    pendingDescription: 'בסינון השנה הנוכחי',
    missingTurnoverTitle: 'חסרי מחזור',
    missingTurnoverDescription: 'בסינון השנה הנוכחי',
    overdueTitle: 'באיחור',
    overdueDescription: 'בסינון השנה הנוכחי',
  },
} as const
