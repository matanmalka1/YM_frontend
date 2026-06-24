export const TASKS_ERROR_MESSAGES = {
  form: {
    titleRequired: 'יש להזין כותרת למשימה',
    titleTooLong: 'הכותרת יכולה להכיל עד 500 תווים',
  },
  mutations: {
    createError: 'שגיאה ביצירת משימה',
    updateError: 'שגיאה בעדכון משימה',
    completeError: 'שגיאה בסימון המשימה כהושלמה',
    cancelError: 'שגיאה בביטול המשימה',
    deleteError: 'שגיאה במחיקת המשימה',
  },
  clientTab: {
    bulkCompleteFailed: 'פעולת הסימון נכשלה',
    bulkAssignFailed: 'פעולת השיוך נכשלה',
    bulkCompletePartial: (succeeded: number, failed: number) => `הושלמו ${succeeded} משימות, ${failed} נכשלו`,
    bulkAssignPartial: (succeeded: number, failed: number) => `שויכו ${succeeded} משימות, ${failed} נכשלו`,
    createError: 'יצירת המשימה נכשלה',
    loadError: 'שגיאה בטעינת משימות',
  },
} as const
