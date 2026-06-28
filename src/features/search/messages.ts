/**
 * Centralized Hebrew UI strings for the search feature. Shared placeholders and
 * option labels that already live in constants remain at their existing owners.
 */
export const SEARCH_MESSAGES = {
  page: {
    title: 'חיפוש',
    description: 'חיפוש גלובלי על פני לקוחות, קלסרים ומסמכים',
    promptTitle: 'מה תרצה למצוא?',
    promptMessage: 'הקלד שם לקוח, מספר קלסר, או השתמש בפילטרים המתקדמים',
    emptyTitle: 'לא נמצאו תוצאות',
    emptyMessage: 'נסה להרחיב את קריטריוני החיפוש או לאפס את הפילטרים',
    resetSearch: 'איפוס חיפוש',
    emptyResults: 'אין תוצאות',
  },
  columns: {
    officeNumber: "מס' לקוח",
    type: 'סוג',
    client: 'לקוח',
    idNumber: 'מספר ת.ז. / ח.פ',
    binderNumber: 'מספר קלסר',
  },
  filters: {
    advanced: 'פילטרים מתקדמים',
    client: 'לקוח',
    clientFallback: (id: string) => `לקוח #${id}`,
    idNumber: 'ת.ז / ח.פ',
    idNumberPlaceholder: 'מספר מזהה',
    binderNumber: 'מספר קלסר',
    binderNumberPlaceholder: 'לדוגמה: 12345',
    clientStatus: 'סטטוס לקוח',
    allStatuses: 'כל הסטטוסים',
    entityType: 'סוג עסק',
    allTypes: 'כל הסוגים',
    binderLocation: 'מיקום קלסר',
    binderCapacity: 'קיבולת קלסר',
    filename: 'שם קובץ',
    activeFilters: (count: number) => `${count} פילטרים פעילים`,
    resetAll: 'איפוס הכל',
  },
  actions: {
    details: 'פירוט',
  },
  documents: {
    type: 'סוג מסמך',
    taxYear: 'שנת מס',
    unknownType: 'סוג מסמך לא ידוע',
    title: 'מסמכים',
    displayedFirst: (limit: number) => `מוצגים ${limit} ראשונים`,
    empty: 'לא נמצאו מסמכים',
  },
} as const
