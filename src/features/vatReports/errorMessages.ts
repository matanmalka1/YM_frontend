export const VAT_ERROR_MESSAGES = {
  validation: {
    originalSubmissionRequired: 'יש להזין מזהה ההגשה המקורית',
    originalSubmissionNumeric: 'מזהה ההגשה המקורית חייב להיות מספר',
    clientRequired: 'יש לבחור לקוח',
    validClientRequired: 'יש לבחור לקוח תקין',
    periodRequired: 'יש להזין תקופה',
    periodFormat: 'פורמט תקופה חייב להיות YYYY-MM',
    grossAmountRequired: 'חובה להזין סכום',
    grossAmountPositive: 'סכום חייב להיות חיובי',
    counterpartyIdRequired: 'חובה להזין מספר עוסק של הספק',
  },
  detail: {
    loadingWorkItemError: 'שגיאה בטעינת תיק מע"מ',
    createWorkItemError: 'שגיאה ביצירת תיק המע״מ',
    loadClientVatError: 'שגיאה בטעינת נתוני מע״מ. אנא נסה שוב מאוחר יותר.',
  },
  page: {
    loadingGroupsError: 'שגיאה בטעינת קבוצות תיקי מע"מ',
    actionAdvisorOnly: 'פעולה זו זמינה ליועץ בלבד',
    actionError: 'שגיאה בביצוע הפעולה',
    sendBackError: 'שגיאה בהחזרת התיק לתיקון',
    createWorkItemError: 'שגיאה ביצירת תיק מע"מ',
  },
  mutations: {
    exportError: 'ייצוא נכשל, נסה שוב',
    filingError: 'שגיאה בהגשה',
    invoiceAddError: 'שגיאה בהוספת חשבונית',
    invoiceDeleteError: 'שגיאה במחיקת חשבונית',
    workItemDeleteError: 'שגיאה במחיקת התיק',
    invoiceUpdateError: 'שגיאה בעדכון חשבונית',
    statusChangeError: 'שגיאה בשינוי סטטוס',
  },
  deleteWorkItem: {
    message: 'האם למחוק את התיק? פעולה זו אינה הפיכה.',
  },
} as const
