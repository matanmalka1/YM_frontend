export const workItemSourceTypeValues = ['vat_work_item', 'annual_report', 'advance_payment', 'charge', 'binder', 'task'] as const

export type WorkItemSourceType = (typeof workItemSourceTypeValues)[number]

export const workItemSourceTypeLabels: Record<WorkItemSourceType, string> = {
  vat_work_item: 'דוח מע"מ',
  annual_report: 'דוח שנתי',
  advance_payment: 'מקדמה',
  charge: 'חיוב לא שולם',
  binder: 'קלסר',
  task: 'משימה',
}

export const isWorkItemSourceType = (value: string | null): value is WorkItemSourceType =>
  value !== null && workItemSourceTypeValues.includes(value as WorkItemSourceType)

export const parseWorkItemSourceType = (value: string | null): WorkItemSourceType | null =>
  isWorkItemSourceType(value) ? value : null
