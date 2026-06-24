/**
 * Centralized Hebrew UI strings for the documents feature. Cross-cutting strings
 * (cancel, loading, generic "actions") stay in GLOBAL_UI_MESSAGES;
 * everything here is documents-domain copy. Grouped by area.
 */
export const DOCUMENTS_MESSAGES = {
  shared: {
    paginationLabel: 'מסמכים',
  },
  form: {
    fileNameLabel: 'שם קובץ',
    documentTypeLabel: 'סוג מסמך',
    taxYearLabel: 'שנת מס',
    taxYearOptionalLabel: 'שנת מס (אופציונלי)',
    businessAssociationLabel: 'שיוך עסקי',
    clientScopedTypeNote: 'סוג מסמך זה שייך ללקוח בלבד',
    fileLabel: 'קובץ',
    removeFileAriaLabel: 'הסר קובץ',
    readyToUpload: 'מוכן להעלאה',
    dropOrClickPrompt: 'גרור קובץ לכאן או לחץ לבחירה',
    acceptedFormats: 'PDF, Word, Excel, תמונות · עד 10MB',
    chooseFile: 'בחירת קובץ',
    uploadFileAriaLabel: 'העלאת קובץ',
  },
  preview: {
    defaultTitle: 'תצוגה מקדימה',
    downloadButton: 'הורד',
    unsupportedFile: 'לא ניתן להציג קובץ זה בתצוגה מקדימה',
    downloadFileButton: 'הורד קובץ',
  },
  versions: {
    loading: 'טוען גרסאות...',
    noVersions: 'אין גרסאות קודמות',
    sectionTitle: 'היסטוריית גרסאות',
    truncatedNote: 'מוצגות 10 גרסאות אחרונות בלבד',
  },
  card: {
    rowActionsAriaLabel: (id: number) => `פעולות נוספות למסמך ${id}`,
    rowActionsTitle: 'פעולות נוספות',
    versionHistoryLabel: 'היסטוריית גרסאות',
    editDetailsLabel: 'עריכת פרטים',
    replacingLabel: 'מחליף...',
    replaceFileLabel: 'החלף קובץ',
    deletingLabel: 'מוחק...',
    deleteLabel: 'מחק',
    noTaxYear: 'ללא שנת מס',
    previewAriaLabel: 'צפייה במסמך',
    previewLabel: 'צפייה',
    downloadAriaLabel: 'הורדת מסמך',
    downloadLabel: 'הורדה',
  },
  list: {
    sectionTitle: (countLabel: string) => `מסמכים (${countLabel})`,
    uploadButton: 'העלאת מסמך',
    noResultsMessage: 'לא נמצאו מסמכים מתאימים לחיפוש',
    emptyMessage: 'עדיין לא הועלו מסמכים ללקוח זה',
    firstUploadAction: 'העלאת מסמך ראשון',
    uploadModalTitle: 'העלאת מסמך חדש',
    uploading: 'מעלה...',
    uploadSubmit: 'העלה מסמך',
    editModalTitle: 'עריכת פרטי מסמך',
    saving: 'שומר...',
    saveLabel: 'שמירה',
    deleteModalTitle: 'מחיקת מסמך',
    deleteMessage: 'האם למחוק מסמך זה?',
    deleteConfirm: 'מחק',
  },
  success: {
    uploaded: 'מסמך הועלה בהצלחה',
    deleted: 'מסמך נמחק',
    replaced: 'מסמך הוחלף',
    updated: 'פרטי המסמך עודכנו',
  },
} as const
