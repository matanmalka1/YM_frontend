/**
 * Centralized Hebrew UI strings for the search feature. Shared placeholders and
 * option labels that already live in constants remain at their existing owners.
 */
export const SEARCH_MESSAGES = {
  page: {
    description: 'חיפוש לקוחות ורשומות לפי שם או מזהה',
    promptTitle: 'מה תרצה למצוא?',
    promptMessage: 'הקלד שם לקוח, ת.ז / ח.פ, מספר לקוח, מספר קלסר, שם קובץ או תקופה',
    emptyTitle: 'לא נמצאו תוצאות',
    emptyMessage: 'נסה מונח אחר או אפס את החיפוש',
    resetSearch: 'איפוס חיפוש',
  },
  clients: {
    title: 'לקוחות תואמים',
    subtitle: (count: number) => `${count} לקוחות תואמים`,
    matchedBinders: (numbers: string[]) => `נמצא לפי קלסר ${numbers.join(', ')}`,
    idNumber: 'ת.ז / ח.פ',
    officeNumber: "מס' לקוח",
  },
  matches: {
    title: 'רשומות תואמות',
    subtitle: (count: number) => `${count} רשומות תואמות`,
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
} as const
