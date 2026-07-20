export const CHARGES_ERROR_MESSAGES = {
  list: { load: 'שגיאה בטעינת רשימת חיובים' },
  client: { load: 'שגיאה בטעינת חיובי הלקוח' },
  detail: { load: 'שגיאה בטעינת פרטי החיוב' },
  mutations: {
    create: 'שגיאה ביצירת חיוב',
    update: 'שגיאה בעדכון חיוב',
    delete: 'שגיאה במחיקת חיוב',
    action: 'שגיאה בביצוע פעולה',
    chargeAction: 'שגיאה בביצוע פעולת חיוב',
    bulkAction: 'שגיאה בביצוע פעולה מרובה',
  },
  permissions: {
    create: 'אין הרשאה ליצור חיוב',
    action: 'אין הרשאה לבצע פעולת חיוב זו',
    detail: 'אין לך הרשאה לבצע פעולה זו',
  },
  bulk: { itemFailure: (id: number, error: string) => `חיוב #${id}: ${error}` },
} as const
