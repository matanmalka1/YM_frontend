export const IMPORT_EXPORT_ERROR_MESSAGES = {
  actions: {
    importRowError: (row: number, error: string) => `שורה ${row}: ${error}`,
    exportError: 'שגיאה בייצוא לקוחות',
    invalidFile: 'יש לבחור קובץ Excel בפורמט xlsx או xls',
    partialSuccess: (created: number) => `נוצרו ${created} לקוחות, וחלק מהשורות נכשלו`,
    moreErrors: (count: number) => `ועוד ${count} שגיאות`,
    importError: 'שגיאה בייבוא לקוחות',
    templateError: 'שגיאה בהורדת תבנית',
  },
} as const
