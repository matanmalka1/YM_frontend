export const NOTIFICATIONS_ERROR_MESSAGES = {
  form: {
    metadataLoad: 'לא ניתן לטעון את סוגי ההודעות. נסו שוב.',
    clientRequired: 'יש לבחור לקוח',
    blockedFallback: 'שליחת ההודעה חסומה',
    previewError: 'שגיאה בטעינת תצוגה מקדימה',
    sendSkippedNoEmail: 'ההודעה לא נשלחה — לא נמצאה כתובת אימייל ללקוח',
    sendError: 'שגיאה בשליחת ההודעה',
    subjectRequired: 'נדרש נושא ההודעה',
    bodyRequired: 'נדרש תוכן ההודעה',
  },
  tab: {
    failed: (count: number) => `נכשלו: ${count}`,
  },
  detail: {
    loadError: 'שגיאה בטעינת פרטי ההודעה',
  },
  page: {
    loadError: 'שגיאה בטעינת הודעות',
  },
} as const
