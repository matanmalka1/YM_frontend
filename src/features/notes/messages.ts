/**
 * Centralized Hebrew UI strings for the notes feature. Cross-cutting strings
 * (cancel, loading) stay in GLOBAL_UI_MESSAGES;
 * everything here is notes-domain copy. Grouped by area.
 */
const formatNotesCount = (total: number) => `${total} הערות`

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
  clientTab: {
    title: 'הערות',
    subtitle: formatNotesCount,
  },
  card: {
    notesCount: formatNotesCount,
    emptyTitle: 'אין הערות עדיין',
    deleteModalTitle: 'מחיקת הערה',
    deleteMessage: 'האם למחוק את ההערה? פעולה זו אינה הפיכה.',
  },
} as const
