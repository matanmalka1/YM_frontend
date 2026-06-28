/**
 * Centralized Hebrew UI strings for the notes feature. Cross-cutting strings
 * (cancel, loading) stay in GLOBAL_UI_MESSAGES;
 * everything here is notes-domain copy. Grouped by area.
 */
export const NOTES_MESSAGES = {
  tags: {
    reminder: 'תזכורת',
    meeting: 'פגישה',
    treatment: 'טיפול',
    documentation: 'תיעוד',
  },
  composer: {
    placeholder: 'הזן הערה...',
  },
  row: {
    editTitle: 'ערוך',
  },
  card: {
    notesCount: (total: number) => `${total} הערות`,
    emptyTitle: 'אין הערות עדיין',
    deleteModalTitle: 'מחיקת הערה',
    deleteMessage: 'האם למחוק את ההערה? פעולה זו אינה הפיכה.',
  },
} as const
