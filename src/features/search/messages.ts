/**
 * Centralized Hebrew UI strings for the search feature. Shared placeholders and
 * option labels that already live in constants remain at their existing owners.
 */
export const SEARCH_MESSAGES = {
  page: {
    description: 'חיפוש לקוחות ורשומות לפי שם או מזהה',
    promptTitle: 'מה תרצה למצוא?',
    promptMessage: 'הקלד שם לקוח, ת.ז / ח.פ, מספר לקוח, מספר קלסר, שם קובץ או תקופה',
    hintsTitle: 'איך לחפש',
    hintsNote: 'לקוחות נמצאים גם לפי חלק מהערך; רשומות נמצאות בהתאמה מדויקת בלבד.',
    emptyTitle: 'לא נמצאו תוצאות',
    emptyMessage: 'נסה מונח אחר או אפס את החיפוש',
    resetSearch: 'איפוס חיפוש',
  },
  /**
   * One line per searchable entity, mirroring the backend match predicates
   * (`search_term_parser` + `search_match_repository`): clients match partially on any public
   * identifier, every record type matches exactly on its own column.
   */
  hints: [
    { label: 'לקוחות', hint: 'שם, ת.ז / ח.פ, מס׳ לקוח או מספר קלסר — גם התאמה חלקית' },
    { label: 'קלסרים', hint: 'מספר קלסר מלא, למשל 1042' },
    { label: 'מסמכים', hint: 'שם הקובץ המלא כולל סיומת, למשל דוח.pdf' },
    { label: 'דוחות מע״מ', hint: 'תקופה בפורמט 03/2026' },
    { label: 'מקדמות', hint: 'תקופה בפורמט 03/2026' },
    { label: 'דוחות שנתיים', hint: 'שנת מס, למשל 2025, או מספר אסמכתא' },
    { label: 'חיובים', hint: 'מספר חיוב' },
    { label: 'משימות', hint: 'כותרת המשימה במלואה' },
    { label: 'הודעות', hint: 'כתובת הנמען — אימייל או טלפון' },
  ],
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
