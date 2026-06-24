/**
 * Centralized Hebrew UI strings for client import/export flows.
 */
export const IMPORT_EXPORT_MESSAGES = {
  exportPanel: {
    title: 'ייצוא לקוחות',
    description: 'הורדת כל נתוני הלקוחות לקובץ Excel מסודר.',
    details: 'הקובץ כולל שדות לקוח, פרטי עסק, סטטוס ונתוני מס רלוונטיים.',
    action: 'ייצוא ל־Excel',
  },
  importPanel: {
    title: 'ייבוא לקוחות',
    warning: 'ייבוא יוצר לקוחות חדשים במערכת. מומלץ להוריד תבנית, למלא אותה, ואז להעלות את הקובץ.',
    templateTitle: 'תבנית ייבוא',
    templateDescription: 'כוללת את שמות העמודות הנדרשים',
    downloadTemplate: 'הורד תבנית',
    fileInputAriaLabel: 'ייבוא קובץ',
    uploadPrompt: 'העלה קובץ Excel בפורמט התבנית',
    importing: 'מייבא...',
    chooseFile: 'בחר קובץ',
    supportedFormats: 'פורמטים נתמכים: xlsx, xls. תאריכים בפורמט YYYY-MM-DD.',
  },
  modal: {
    title: 'ייבוא וייצוא לקוחות',
  },
  actions: {
    importRowError: (row: number, error: string) => `שורה ${row}: ${error}`,
    exportSuccess: 'ייצוא לקוחות הושלם בהצלחה',
    exportError: 'שגיאה בייצוא לקוחות',
    invalidFile: 'יש לבחור קובץ Excel בפורמט xlsx או xls',
    partialSuccess: (created: number) => `נוצרו ${created} לקוחות, וחלק מהשורות נכשלו`,
    noneCreated: 'לא נוצרו לקוחות',
    moreErrors: (count: number) => `ועוד ${count} שגיאות`,
    importSuccess: (created: number, totalRows: number) => `נוצרו ${created} לקוחות מתוך ${totalRows} שורות`,
    importError: 'שגיאה בייבוא לקוחות',
    templateSuccess: 'התבנית ירדה בהצלחה',
    templateError: 'שגיאה בהורדת תבנית',
  },
} as const
