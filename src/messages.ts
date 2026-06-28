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
    save: 'שמור',
    delete: 'מחק',
    add: 'הוסף',
    edit: 'עריכה',
    view: 'צפה',
    retry: 'נסה שוב',
    back: 'חזרה',
    next: 'הבא',
    clearSelection: 'נקה בחירה',
    selectAll: 'בחר הכל',
  },
  common: {
    actions: 'פעולות',
    loading: 'טוען...',
    loadingData: 'טוען נתונים...',
    saving: 'שומר...',
    noData: 'אין נתונים להצגה',
    noResults: 'אין תוצאות',
    results: 'תוצאות',
    status: 'סטטוס',
    client: 'לקוח',
    clients: 'לקוחות',
    notes: 'הערות',
    details: 'פרטים',
    date: 'תאריך',
    dialog: 'תיבת דו-שיח',
  },
  pagination: {
    nav: 'פגינציה',
    previousPage: 'עמוד קודם',
    nextPage: 'עמוד הבא',
    pageSummary: (page: number, total: number) => `עמוד ${page} מתוך ${total}`,
  },
  filters: {
    active: 'מסננים פעילים',
    clearAll: 'נקה הכל',
    removeFilter: 'הסר סינון',
  },
} as const
