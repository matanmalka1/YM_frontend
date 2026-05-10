export const taskStatusValues = ['open', 'in_progress', 'done', 'canceled'] as const
export const taskPriorityValues = ['low', 'normal', 'high', 'urgent'] as const

export const taskStatusLabels: Record<string, string> = {
  open: 'פתוחה',
  in_progress: 'בטיפול',
  done: 'הושלמה',
  canceled: 'בוטלה',
}

export const taskPriorityLabels: Record<string, string> = {
  low: 'נמוכה',
  normal: 'רגילה',
  high: 'גבוהה',
  urgent: 'דחוף',
}
