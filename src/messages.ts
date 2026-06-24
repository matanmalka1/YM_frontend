/**
 * Centralized Hebrew UI strings shared across generic, cross-cutting components
 * (overlays, tables, layout primitives). Feature-specific copy stays in each
 * feature; this catalog holds only strings reused by shared/ui building blocks.
 */
export const GLOBAL_UI_MESSAGES = {
  actions: {
    confirm: 'אישור',
    cancel: 'ביטול',
    close: 'סגירה',
    clearSelection: 'נקה בחירה',
    selectAll: 'בחר הכל',
  },
  common: {
    actions: 'פעולות',
    loading: 'טוען...',
    loadingData: 'טוען נתונים...',
    noData: 'אין נתונים להצגה',
    results: 'תוצאות',
    dialog: 'תיבת דו-שיח',
  },
  pagination: {
    nav: 'פגינציה',
    previousPage: 'עמוד קודם',
    nextPage: 'עמוד הבא',
  },
} as const
