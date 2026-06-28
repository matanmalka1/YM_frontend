/**
 * Centralized Hebrew UI strings for the correspondence feature. Cross-cutting strings
 * (cancel, loading) stay in GLOBAL_UI_MESSAGES;
 * everything here is correspondence-domain copy. Grouped by area.
 */
export const CORRESPONDENCE_MESSAGES = {
  entry: {
    editTitle: 'ערוך רשומה',
    deleteTitle: 'מחק רשומה',
  },
  card: {
    title: 'יומן תקשורת עם רשויות',
    recordsCount: (total: number) => `${total} רשומות`,
    addRecordButton: 'הוסף רשומה',
    emptyMessage: 'אין רשומות תקשורת עדיין — הוסף את הרשומה הראשונה',
    deleteModalTitle: 'מחיקת רשומה',
    deleteMessage: 'האם למחוק את הרשומה? פעולה זו אינה הפיכה.',
  },
  modal: {
    editTitle: 'עריכת רשומת התכתבות',
    addTitle: 'הוספת רשומת התכתבות',
    updateButton: 'עדכן',
    typeLabel: 'סוג',
    subjectLabel: 'נושא *',
    dateLabel: 'תאריך *',
    contactLabel: 'איש קשר (רשות)',
    noContactOption: 'ללא איש קשר',
    notesPlaceholder: 'הוסף הערות...',
  },
} as const
