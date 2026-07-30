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
export const TURNOVER_SOURCE_SHORT_LABELS: Record<TurnoverSource, string> = {
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
  periodNavigation: {
    ariaLabel: 'ניווט בין תקופות המקדמה',
    pickerLabel: 'תקופת דיווח',
    previous: 'לתקופה הקודמת',
    next: 'לתקופה הבאה',
    loadError: 'לא ניתן לטעון תקופות נוספות',
  },
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
    mismatchBadge: 'אי-התאמת מע״מ',
    mismatchAlert: (vatAmount: string, difference: string) =>
      `המחזור הרשום שונה מדוח המע״מ לתקופה (${vatAmount}) — הפרש ${difference}. ניתן לקבע מחדש בכפתור "קבע לפי מע״מ".`,
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
    overrideAmountLabel: 'סכום עקיפה',
    withheldAmountLabel: 'ניכוי במקור',
    paymentMethodLabel: 'שיטת תשלום',
    paymentReferenceLabel: 'מספר אסמכתא',
    paidAtLabel: 'תאריך ביצוע',
  },
  statusPanel: {
    title: 'סטטוס התקופה',
    advanceStage: (label: string) => `העבר ל"${label}"`,
    close: 'סגירת התקופה',
    sendBack: 'החזר שלב אחורה',
    cancel: 'ביטול התקופה',
    sendBackModalTitle: 'החזרת התקופה שלב אחורה',
    sendBackReasonPlaceholder: 'סיבת ההחזרה (חובה)',
    sendBackConfirm: 'החזר',
    cancelModalTitle: 'ביטול התקופה',
    cancelModalMessage: 'תקופה שבוטלה אינה ניתנת לשחזור. להמשיך?',
    cancelConfirm: 'כן, בטל',
    transitionSuccess: 'סטטוס המקדמה עודכן',
    closeSuccess: 'התקופה נסגרה',
    readinessLoading: 'בודק מוכנות לסגירה…',
    readinessReady: 'התקופה מוכנה לסגירה',
    readinessNotReady: (count: number) => `לא ניתן לסגור — ${count} דרישות חסרות`,
    lockedNotice: 'התקופה הוגשה ואינה ניתנת לשינוי — כל תיקון דורש רשומת תיקון',
  },
  detailActions: {
    deleteAriaLabel: 'מחק מקדמה',
    deleteTitle: 'מחק מקדמה',
    deleteModalTitle: 'מחיקת מקדמה',
    deleteModalMessage: 'האם למחוק מקדמה זו?',
    deleteReasonPlaceholder: 'סיבת המחיקה (חובה)',
    deleteConfirm: 'כן, מחק',
    withdrawTitle: 'בטל תיקון',
    withdrawModalTitle: 'ביטול המקדמה המתקנת',
    withdrawModalMessage:
      'המקדמה המתקנת תוסר, והמקדמה שנסגרה תחזור להיות המקדמה של התקופה. ההיסטוריה תישמר וניתן יהיה ליצור תיקון חדש.',
    withdrawConfirm: 'כן, בטל תיקון',
    withdrawSuccess: 'התיקון בוטל, המקדמה שנסגרה חזרה להיות המקדמה של התקופה',
  },
  chain: {
    title: 'היסטוריית תיקונים',
    trigger: 'הצג היסטוריית תיקונים',
    empty: 'אין תיקונים לתקופה זו',
    original: 'מקורי',
    amendment: 'דוח מתקן',
    current: 'נוכחי',
    withdrawn: 'בוטל',
    closedAt: (date: string) => `נסגר ${date}`,
    open: 'פתוח',
  },
  detail: {
    fallbackTitle: 'מקדמה',
    expectedStatTitle: 'סכום צפוי',
    paidStatTitle: 'שולם',
    balanceStatTitle: 'יתרה לתשלום',
    turnoverStatTitle: 'מחזור לתקופה',
    annualContextTitle: (year: number) => `סיכום שנתי · ${year}`,
    annualContextLoading: 'טוען סיכום שנתי',
    annualExpectedLabel: 'סה״כ צפוי',
    annualPaidLabel: 'סה״כ שולם',
    annualBalanceLabel: 'יתרה שנתית',
    contextSectionTitle: 'פרטי לקוח ותקופה',
    paidLateLabel: 'שולם באיחור',
    overdueLabel: 'באיחור',
    idNumberLabel: 'ת.ז / ח.פ',
    advanceRateLabel: 'שיעור מקדמה',
    periodLabel: 'תקופת דיווח',
    paidOnTimeLabel: 'בזמן',
    noNewDueDateLabel: 'ללא מועד חדש',
    noNewDueDateDescription: 'אין מועד חדש — דוח מתקן',
    unsavedChangesNotice: 'קיימים שינויים שטרם נשמרו',
    paidInFullBadge: 'שולם במלואו',
    balanceDueBadge: 'נדרשת הסדרת תשלום',
    turnoverSourceBadge: (source: TurnoverSource) => TURNOVER_SOURCE_SHORT_LABELS[source],
    turnoverMissingBadge: 'חסר מחזור',
    quickNavTitle: 'ניווט מהיר',
    quickNavClientPayments: 'כל מקדמות הלקוח',
    quickNavVat: 'דיווחי מע״מ',
    quickNavAnnualReports: 'דוחות שנתיים',
    turnoverWithSource: (amount: string, source: TurnoverSource) => `${amount} (${TURNOVER_SOURCE_SHORT_LABELS[source]})`,
    title: (period: string) => `מקדמה - ${period}`,
    clientNumberPrefix: (num: number) => `מס׳ לקוח ${num}`,
    missingTurnoverAlert: 'חסר מחזור לתקופה — לא ניתן לחשב מקדמה מדויקת',
    periodSectionTitle: 'פרטי תקופה',
    dueDateLabel: 'תאריך יעד',
    noVatReportNote: 'אין דוח מע״מ לתקופה',
    timingStatusLabel: 'סטטוס עמידה',
    auditTitle: 'יומן שינויים',
    auditSubtitle: 'שינויים שבוצעו במקדמה',
    interestIndicationNote: 'ריבית והצמדה נצברות לפי סעיף 190 — הסכום הרשמי בשע״מ',
  },
  editableSections: {
    calculationSectionTitle: 'חישוב מקדמה',
    periodTurnoverLabel: 'מחזור לתקופה',
    refreshTurnoverButton: 'קבע לפי מע״מ',
    vatSyncedNote: 'המחזור מקובע מדוח המע״מ — אין צורך בקיבוע נוסף',
    availableActionHint: 'לחיצה על "קבע לפי מע״מ" תמלא את המחזור מהדוח',
    vatPendingAlert: 'מבוסס על דוח מע״מ שטרם הוגש',
    calculatedAmountLabel: 'סכום מחושב',
    overrideAmountLabel: 'סכום עקיפה (אופציונלי)',
    overrideHint: 'השאירו ריק לשימוש בסכום המחושב — כל ערך שמוזן (כולל 0) קובע את הסכום הסופי',
    withheldAmountLabel: 'ניכוי במקור (אופציונלי)',
    withheldHint: 'מנוכה מהסכום המחושב לפני קביעת הסכום הסופי — אינו משפיע כאשר קיימת עקיפה',
    withheldBreakdownCell: 'ניכוי במקור',
    finalAmountLabel: 'סכום סופי',
    paymentSectionTitle: 'עדכון תשלום',
    noMethodOption: 'ללא',
    paymentReferenceLabel: 'מספר אסמכתא (לא חובה)',
    paymentReferencePlaceholder: 'אסמכתת ההעברה / שובר',
    paidAtLabel: 'תאריך ביצוע תשלום',
    notesPlaceholder: 'הערות...',
    fillFullAmountButton: 'שולם במלואו',
    resetPaidButton: 'אפס תשלום',
    setTodayButton: 'הגדר תאריך ביצוע להיום',
    calculationSectionSubtitle: 'חישוב סכום החיוב לפי מחזור ואחוז המקדמה',
    paymentSectionSubtitle: 'תיעוד ביצוע תשלום והערות',
    calcBreakdownTitle: 'פירוט חישוב',
    reportedTurnoverCell: 'מחזור מדווח',
    manualOverrideBadge: 'קביעה ידנית',
  },
  batchColumns: {
    officeNumberHeader: 'מס׳ לקוח',
    idNumberHeader: 'ת.ז / ח.פ',
    periodHeader: 'תקופת דיווח',
    expectedHeader: 'צפוי',
    paidHeader: 'שולם',
    withheldHeader: 'ניכוי במקור',
    balanceHeader: 'יתרה',
    advanceRateHeader: 'אחוז מקדמה',
    rowActionsAriaLabel: (id: number) => `פעולות למקדמה ${id}`,
    updatePaymentAction: 'עדכן תשלום',
    goToClientAction: 'עבור ללקוח',
  },
  bulkMarkPaid: {
    modalTitle: 'סימון כשולם באצווה',
    modalMessage: (count: number) => `${count} מקדמות יסומנו כשולמות במלואן (חלקיות יושלמו ליתרה).`,
    paidAtLabel: 'תאריך תשלום',
    referencePrefixLabel: 'קידומת אסמכתא (לא חובה)',
    referencePrefixPlaceholder: 'למשל BATCH-07',
    referencePrefixHint: 'כל מקדמה תקבל אסמכתא בצורת "קידומת-מזהה"',
    confirmButton: 'בצע',
    selectRowAriaLabel: (id: number) => `בחר מקדמה ${id}`,
    selectAllAriaLabel: 'בחר את כל המקדמות בעמוד',
    result: ({ updated, skipped }: { updated: number[]; skipped: { reason: string }[] }) => {
      const alreadyPaid = skipped.filter((item) => item.reason === 'already_paid').length
      const noAmount = skipped.filter((item) => item.reason === 'no_amount').length
      return [
        `${updated.length} מקדמות עודכנו`,
        alreadyPaid > 0 ? `${alreadyPaid} כבר שולמו` : null,
        noAmount > 0 ? `${noAmount} ללא סכום לתשלום` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    },
  },
  bulkRateUpdate: {
    actionButton: 'עדכן שיעור מקדמה',
    modalTitle: 'עדכון שיעור מקדמה מתקופה',
    description: (currentRate: number | null) =>
      currentRate != null
        ? `השיעור הנוכחי הוא ${currentRate}%. השיעור החדש יחול על התקופות שטרם שולמו מהתקופה שנבחרה ואילך, ויוגדר כברירת המחדל של הלקוח.`
        : 'השיעור החדש יחול על התקופות שטרם שולמו מהתקופה שנבחרה ואילך, ויוגדר כברירת המחדל של הלקוח.',
    rateLabel: 'שיעור מקדמה חדש (%)',
    fromYearLabel: 'החל משנת מס',
    fromMonthLabel: 'החל מחודש',
    fromPeriodPlaceholder: 'בחר',
    confirmButton: 'עדכן שיעור',
    result: ({ updated, skipped }: { updated: number; skipped: number }) =>
      [`${updated} תקופות עודכנו`, skipped > 0 ? `${skipped} דולגו (שולמו / שולמו חלקית)` : null, 'ברירת המחדל של הלקוח עודכנה']
        .filter(Boolean)
        .join(' · '),
  },
  batchRow: {
    typeLabel: 'מקדמות',
    dueDatePrefix: 'לתשלום עד',
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
    singleClientMode: 'לקוח בודד',
    officeMode: 'כל המשרד',
    yearLabel: 'שנת מס',
    result: ({ created, skipped, removed, settled }: { created: number; skipped: number; removed: number; settled: number }) =>
      [
        created > 0 ? `נוצרו ${created} מקדמות` : 'לא נוצרו מקדמות חדשות',
        skipped > 0 ? `דולגו ${skipped}` : null,
        removed > 0 ? `הוסרו ${removed} מקדמות בתדירות הקודמת` : null,
        settled > 0 ? `${settled} תקופות בתדירות הקודמת כבר שולמו ונשארו` : null,
      ]
        .filter(Boolean)
        .join(' · '),
  },
  staleCadence: {
    confirmTitle: 'תדירות המקדמות של הלקוח השתנתה',
    confirmMessage: (pending: number) =>
      `קיימות ${pending} מקדמות עתידיות שטרם שולמו בתדירות הקודמת, והן חוסמות את יצירת הלוח החדש. ` +
      'כדי להמשיך יש למחוק אותן. מקדמות ששולמו במלואן או בחלקן לא יימחקו.',
    confirmButton: 'מחק וצור לוח חדש',
    removedNote: (removed: number) => `הוסרו ${removed} מקדמות עתידיות בתדירות הקודמת`,
    settledNote: (settled: number) => `${settled} תקופות בתדירות הקודמת כבר שולמו — הן יישארו כפי שהן ויש לטפל בהן ידנית`,
    officeTitle: (pending: number) => `${pending} מקדמות בתדירות קודמת חוסמות חלק מהלקוחות`,
    officeNote: 'לקוחות שתדירות המקדמות שלהם שונתה לא קיבלו לוח חדש. אישור ימחק את המקדמות העתידיות שטרם שולמו ויריץ שוב.',
    officeConfirmButton: 'מחק וצור מחדש למשרד',
  },
  bulkGenerate: {
    loadingPreview: 'טוען את רשימת הלקוחות...',
    eligibleCount: (count: number) => `${count} לקוחות זכאים ליצירת לוח שנתי`,
    noEligibleClients: 'אין לקוחות זכאים ליצירת לוח שנתי',
    createButton: 'צור לוחות למשרד',
    runningProgress: ({ processed, total }: { processed: number; total: number }) => `מעבד ${processed} מתוך ${total} לקוחות...`,
    doneSummary: ({ clients, created }: { clients: number; created: number }) => `נוצרו ${created} מקדמות עבור ${clients} לקוחות`,
    skippedNote: (skipped: number) => `דולגו ${skipped} תקופות שכבר קיימות או שמועד התשלום שלהן חלף`,
    ineligibleTitle: (count: number) => `${count} לקוחות ללא תדירות מקדמות מוגדרת — לא נוצר להם לוח`,
    ineligibleNote: 'הגדירו תדירות מקדמות בכרטיס הלקוח ואז הריצו יצירה פרטנית',
    failedTitle: (count: number) => `${count} לקוחות נכשלו`,
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
    paidAmountLabel: 'סכום ששולם (אופציונלי)',
    notesLabel: 'הערות (אופציונלי)',
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
  },
  clientCards: {
    empty: 'אין מקדמות להצגה',
    dueDateLabel: 'לתשלום עד',
    paidAtLabel: 'שולם ב',
    paidLabel: 'שולם',
    balanceLabel: 'יתרה',
    expectedLabel: 'צפוי לתשלום',
    overdue: 'באיחור',
    viewDetails: 'צפה בפרטים',
  },
  clientHeader: {
    loadingLabel: 'יוצר...',
    noFrequencyTooltip: 'לא ניתן ליצור לוח בלי תדירות מקדמות בפרופיל הלקוח',
    confirmTitle: 'יצירת לוח מקדמות',
    confirmButton: 'צור',
    advanceRateNote: (rate: number) => `אחוז מקדמות: ${rate}%`,
    confirmMessage: (frequencyLabel: string, year: number) =>
      `ליצור מקדמות ${frequencyLabel} לשנת ${year}? ייווצרו רק מקדמות שתאריך היעד שלהן מהיום והלאה. מקדמות קיימות לא יושפעו.`,
  },
  clientStats: {
    collectionRateTitle: 'שיעור גבייה',
    overdueTitle: 'פיגורים',
  },
  stats: {
    dueThisMonthTitle: 'לתשלום החודש',
    dueThisMonthDescription: 'מקדמות לתקופה הנוכחית',
    pendingTitle: 'לקוחות ממתינים',
    pendingDescription: 'בסינון השנה הנוכחי',
    missingTurnoverDescription: 'בסינון השנה הנוכחי',
    overdueTitle: 'באיחור',
    overdueDescription: 'בסינון השנה הנוכחי',
  },
  overviewSort: {
    sortByLabel: 'מיין לפי',
    orderLabel: 'כיוון מיון',
    orderAsc: 'סדר עולה',
    orderDesc: 'סדר יורד',
    paidAmountLabel: 'שולם',
    deltaLabel: 'יתרה',
  },
  vatMismatchFilter: {
    label: 'התאמת מע״מ',
    mismatchOnlyOption: 'אי-התאמות בלבד',
  },
} as const
