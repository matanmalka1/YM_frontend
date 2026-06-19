export const taskStatusValues = ['open', 'done', 'canceled'] as const
export type TaskStatus = (typeof taskStatusValues)[number]
export const taskPriorityValues = ['low', 'normal', 'high', 'urgent'] as const

export const taskStatusLabels: Record<TaskStatus, string> = {
  open: 'פתוחה',
  done: 'הושלמה',
  canceled: 'בוטלה',
}

export const taskPriorityLabels: Record<string, string> = {
  low: 'נמוכה',
  normal: 'רגילה',
  high: 'גבוהה',
  urgent: 'דחוף',
}

export const taskRoleLabels: Record<string, string> = {
  advisor: 'יועץ',
  secretary: 'מזכירה',
  ADVISOR: 'יועץ',
  SECRETARY: 'מזכירה',
}
