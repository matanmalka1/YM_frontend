export const TAX_CALENDAR_SETTINGS_MESSAGES = {
  ruleTypes: {
    vatMonthly: 'מע״מ חודשי',
    vatBimonthly: 'מע״מ דו־חודשי',
    advanceMonthly: 'מקדמות חודשיות',
    advanceBimonthly: 'מקדמות דו־חודשיות',
    annualReport: 'דוח שנתי',
  },
  obligationTypes: {
    vat: 'מע״מ',
    advancePayment: 'מקדמות מס הכנסה',
    annualReport: 'דוח שנתי',
  },
  labels: {
    startYear: 'שנת ההתחלה',
    endYear: 'שנת הסיום',
    pageTitle: 'הגדרות יומן מס',
    limitedAccessDescription: 'צפייה בכללי תאריכי יעד וברשומות יומן מס',
    description: 'צפייה בכללי תאריכי יעד וברשומות שנוצרו ליומן המס',
    accessDenied: 'גישה להגדרות יומן מס זמינה ליועצים בלבד.',
    startYearField: 'משנת מס',
    endYearField: 'עד שנת מס',
    resetYears: 'איפוס שנים',
    initializeCalendar: 'אתחול יומן מס',
    initializing: 'מאתחל...',
    deadlineRulesTitle: 'כללי תאריכי יעד',
    calendarEntriesTitle: 'רשומות יומן מס',
    taxYear: (year: string) => `שנת מס ${year}`,
    entriesCount: (count: string) => `${count} רשומות`,
  },
  warnings: {
    countMismatch: (year: string, label: string, expected: string, found: string) =>
      `שנת ${year}: ${label} — צפויות ${expected} רשומות, נמצאו ${found}.`,
    fallbackDates: (year: string) => `שנת ${year} משתמשת בתאריכי ברירת מחדל משום שחסרים נתוני יומן מס רשמיים.`,
  },
  columns: {
    ruleType: 'סוג כלל',
    dueDayOfMonth: 'יום בחודש',
    offsetMonths: 'היסט חודשים',
    effectiveFrom: 'בתוקף מ',
    effectiveTo: 'בתוקף עד',
    period: 'תקופה',
    periodMonthsCount: 'מספר חודשים',
    dueDate: 'תאריך יעד',
  },
  emptyStates: {
    noRulesTitle: 'אין כללים להצגה',
    noRulesMessage: 'לא נמצאו כללי תאריכי יעד.',
    noEntriesTitle: 'אין רשומות להצגה',
    noEntriesMessage: 'לא נמצאו רשומות יומן מס בטווח השנים שנבחר.',
  },
  bootstrap: {
    complete: (created: string, skipped: string, total: string) =>
      `אתחול הושלם: ${created} רשומות נוצרו, ${skipped} רשומות דולגו, ${total} רשומות קיימות בטווח.`,
  },
  stats: {
    yearRangeTitle: 'טווח שנים',
    yearRangeDescription: 'טווח השנים של תקציר יומן המס',
    entriesTitle: 'רשומות',
    entriesDescription: 'רשומות יומן המס בטווח שנבחר',
    warningsTitle: 'אזהרות',
    warningsDescription: 'פערים שנמצאו בבדיקת היומן',
  },
} as const
