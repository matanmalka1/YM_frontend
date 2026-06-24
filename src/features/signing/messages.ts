/**
 * Centralized Hebrew UI strings for the public signing flow.
 */
export const SIGNING_MESSAGES = {
  page: {
    title: 'חתימה דיגיטלית',
    subtitle: 'מערכת ניהול משרד · מאובטח ומוצפן',
    footer: 'מערכת ניהול משרד · חתימה מאובטחת ומוצפנת',
  },
  confirmApprove: {
    title: 'אישור חתימה',
    message: (title: string) => `האם אתה/ת בטוח/ה שברצונך לחתום על "${title}"?`,
    back: 'חזרה',
    submit: 'כן, אני חותם/ת',
  },
  confirmDecline: {
    title: 'דחיית בקשה',
    message: 'האם אתה/ת בטוח/ה שברצונך לדחות את בקשת החתימה?',
    reasonLabel: 'סיבת דחייה (אופציונלי)',
    reasonPlaceholder: 'תאר/י את הסיבה לדחייה...',
    submit: 'דחיית הבקשה',
  },
  details: {
    signerName: 'שם החותם',
    expiresAt: 'תוקף הקישור',
    expired: 'פג תוקף',
    expiredAlert: 'קישור זה פג תוקפו. לא ניתן לחתום. פנה למשרד לחידוש הבקשה.',
    legalNotice:
      'בלחיצה על "אני מאשר/ת וחותם/ת" הנך מאשר/ת את תוכן המסמך ומסכים/ה לחתימה דיגיטלית מחייבת בהתאם לחוק חתימה אלקטרונית (התשס"א-2001).',
    decline: 'דחייה',
    approve: 'אני מאשר/ת וחותם/ת',
  },
  status: {
    loading: 'טוען מסמך...',
    signedTitle: 'המסמך נחתם בהצלחה',
    signedBody: 'תודה! חתימתך נקלטה במערכת.',
    declinedTitle: 'הבקשה נדחתה',
    declinedBody: 'דחית את בקשת החתימה. פנה למשרד לפרטים נוספים.',
    expiredTitle: 'הקישור פג תוקף',
    unavailableTitle: 'בקשה לא זמינה',
    expiredBody: 'קישור זה לחתימה פג תוקפו. פנה למשרד לקבלת קישור חדש.',
    unavailableBody: 'הקישור שגוי, בוטל, או שאירעה שגיאה. פנה למשרד לבירור.',
  },
} as const
