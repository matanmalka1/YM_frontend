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
    exportSuccess: 'ייצוא לקוחות הושלם בהצלחה',
    noneCreated: 'לא נוצרו לקוחות',
    importSuccess: (created: number, totalRows: number) => `נוצרו ${created} לקוחות מתוך ${totalRows} שורות`,
    templateSuccess: 'התבנית ירדה בהצלחה',
  },
} as const
