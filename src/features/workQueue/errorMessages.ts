export const WORK_QUEUE_ERROR_MESSAGES = {
  page: {
    roleError: 'לא ניתן לזהות תפקיד משתמש',
    loadError: 'שגיאה בטעינת תור העבודה',
    loadToast: 'טעינת העבודה לטיפול נכשלה',
  },
  stats: {
    summaryError: 'שגיאה בטעינת הסיכום',
  },
  actions: {
    invalidAction: 'פעולה לא תקינה',
    unsupportedAction: 'פעולה לא נתמכת',
    failure: 'הפעולה נכשלה',
    createTaskError: 'יצירת המשימה נכשלה',
    updateTaskError: 'עדכון המשימה נכשל',
    taskNotFound: 'לא נמצאה משימה לפתיחה',
  },
} as const
