/**
 * Centralized Hebrew UI strings for the search feature. Shared placeholders and
 * option labels that already live in constants remain at their existing owners.
 */
export const SEARCH_MESSAGES = {
  page: {
    description: 'חיפוש לקוח והצגת כל הפריטים שלו במקום אחד',
    promptTitle: 'את מי תרצה למצוא?',
    promptMessage: 'הקלד שם לקוח, ת.ז / ח.פ, מספר לקוח או מספר קלסר',
    emptyTitle: 'לא נמצא לקוח',
    emptyMessage: 'נסה מזהה אחר או אפס את הפילטרים',
    resetSearch: 'איפוס חיפוש',
  },
  clients: {
    title: 'לקוחות תואמים',
    subtitle: (count: number) => `${count} לקוחות תואמים — בחר אחד`,
    matchedBinders: (numbers: string[]) => `נמצא לפי קלסר ${numbers.join(', ')}`,
    idNumber: 'ת.ז / ח.פ',
    officeNumber: "מס' לקוח",
    change: 'החלף לקוח',
  },
  feed: {
    emptyTitle: 'אין פריטים ללקוח זה',
    emptyMessage: 'עדיין לא נרשמו קלסרים, מסמכים או פעילות עבור הלקוח',
    allTypes: 'הכל',
    typeLabels: {
      binder: 'קלסרים',
      document: 'מסמכים',
      vat_work_item: 'דוחות מע״מ',
      annual_report: 'דוחות שנתיים',
      advance_payment: 'מקדמות',
      charge: 'חיובים',
      task: 'משימות',
      notification: 'הודעות',
    },
  },
  filters: {
    advanced: 'פילטרים מתקדמים',
    clientFallback: (id: string) => `לקוח #${id}`,
    jumpToClient: 'קפיצה ללקוח',
    binderNumber: 'מספר קלסר',
    binderNumberPlaceholder: 'לדוגמה: 100020/1',
    clientStatus: 'סטטוס לקוח',
    entityType: 'סוג יישות',
    binderLocation: 'מיקום קלסר',
    binderCapacity: 'קיבולת קלסר',
    activeFilters: (count: number) => `${count} פילטרים פעילים`,
    resetAll: 'איפוס הכל',
  },
} as const
