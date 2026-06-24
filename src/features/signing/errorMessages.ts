/**
 * Centralized Hebrew error strings for the public signing flow.
 */
export const SIGNING_ERROR_MESSAGES = {
  details: {
    expiredAlert: 'קישור זה פג תוקפו. לא ניתן לחתום. פנה למשרד לחידוש הבקשה.',
  },
  status: {
    expiredTitle: 'הקישור פג תוקף',
    unavailableTitle: 'בקשה לא זמינה',
    expiredBody: 'קישור זה לחתימה פג תוקפו. פנה למשרד לקבלת קישור חדש.',
    unavailableBody: 'הקישור שגוי, בוטל, או שאירעה שגיאה. פנה למשרד לבירור.',
  },
} as const
