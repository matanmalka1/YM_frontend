export const ANNUAL_REPORTS_ERROR_MESSAGES = {
  fullPanel: { loadError: 'שגיאה בטעינת הדוח' },
  amend: { minLength: (minLength: number) => `נדרשים לפחות ${minLength} תווים` },
  reports: {
    create: 'שגיאה ביצירת דוח',
    load: 'שגיאה בטעינת דוח',
    update: 'שגיאה בעדכון דוח',
    delete: 'שגיאה במחיקת דוח',
    statusUpdate: 'שגיאה בעדכון סטטוס',
    draftExport: 'שגיאה בהפקת הטיוטה',
    clientListLoad: 'שגיאה בטעינת דוחות שנתיים',
    seasonSummaryLoad: 'שגיאה בטעינת סיכום עונה',
    seasonListLoad: 'שגיאה בטעינת דוחות',
    taxYearLoad: 'שגיאה בטעינת שנת מס',
  },
  schedules: {
    update: 'שגיאה בעדכון נספח',
    add: 'שגיאה בהוספת נספח',
  },
  annex: {
    add: 'שגיאה בהוספת שורה',
    update: 'שגיאה בעדכון שורה',
    delete: 'שגיאה במחיקת שורה',
  },
  statusTransition: { amend: 'שגיאה בשליחת תיקון' },
  taxCalculation: {
    loadError: 'שגיאה בטעינת חישוב מס',
    detailSave: 'שגיאה בשמירת נתוני דוח',
    calculationSave: 'שגיאה בשמירת חישוב המס',
  },
  financials: {
    incomeAdd: 'שגיאה בהוספת הכנסה',
    incomeDelete: 'שגיאה במחיקת הכנסה',
    incomeUpdate: 'שגיאה בעדכון הכנסה',
    expenseAdd: 'שגיאה בהוספת הוצאה',
    expenseDelete: 'שגיאה במחיקת הוצאה',
    expenseUpdate: 'שגיאה בעדכון הוצאה',
  },
} as const
