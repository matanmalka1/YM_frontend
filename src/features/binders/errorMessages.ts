export const BINDERS_ERROR_MESSAGES = {
  page: {
    loadError: 'שגיאה בטעינת רשימת קלסרים',
  },
  receive: {
    duplicateBinderNumber: 'קיים כבר קלסר עם מספר זה ללקוח',
    receiveError: 'שגיאה בקליטת חומר',
  },
  validation: {
    clientRequired: 'נא לבחור לקוח',
    businessRequired: 'נא לבחור עסק',
    materialTypeRequired: 'נא לבחור לפחות סוג חומר אחד',
    annualReportRequired: 'נא לבחור דוח שנתי',
    reportingYearRequired: 'נא לבחור שנת דיווח',
    receivedAtRequired: 'נא לבחור תאריך קבלה',
    futureDateNotAllowed: 'לא ניתן לבחור תאריך עתידי',
    reportingMonthRequired: 'נא לבחור חודש דיווח',
    salaryMonthRequired: 'נא לבחור חודש שכר',
  },
  documents: {
    loadError: 'שגיאה בטעינת מסמכי הקלסר',
  },
  mutations: {
    deleteError: 'שגיאה במחיקת קלסר',
    markReadyError: 'שגיאה בסימון קלסר כמוכן למסירה',
    receiveMaterialError: 'שגיאה ברישום קליטת חומר',
    markFullError: 'שגיאה בסימון קלסר כמלא',
    reopenCapacityError: 'שגיאה בפתיחת קיבולת הקלסר',
    bulkReadyEmpty: 'לא נמצאו קלסרים מתאימים לסימון',
    bulkReadyError: 'שגיאה בסימון קבוצתי למסירה',
    revertReadyError: 'שגיאה בביטול סטטוס מוכן למסירה',
    handoverError: 'שגיאה במסירת קלסר',
    bulkHandoverError: 'שגיאה במסירת קלסרים',
  },
} as const
