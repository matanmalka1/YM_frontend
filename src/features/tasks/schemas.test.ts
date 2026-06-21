import { describe, expect, it } from 'vitest'
import { getTaskFormDefaultValues, taskFormSchema } from './schemas'

describe('task form schema', () => {
  const validValues = {
    title: 'בדיקת מסמכים',
    description: '',
    priority: 'normal' as const,
    dueDate: '',
    assignedToUserId: '',
    assignedRole: '',
  }

  it('rejects an empty or oversized title before submission', () => {
    expect(taskFormSchema.safeParse({ ...validValues, title: '   ' }).success).toBe(false)
    expect(taskFormSchema.safeParse({ ...validValues, title: 'א'.repeat(501) }).success).toBe(false)
  })

  it('preserves editable task fields, including a specific assignee', () => {
    expect(taskFormSchema.parse({ ...validValues, assignedToUserId: '27', assignedRole: 'advisor' })).toMatchObject({
      assignedToUserId: '27',
      assignedRole: 'advisor',
    })
  })

  it('maps nullable task fields to form-safe defaults', () => {
    expect(getTaskFormDefaultValues(null, '2026-07-15T00:00:00Z')).toMatchObject({
      dueDate: '2026-07-15',
      assignedToUserId: '',
      assignedRole: '',
    })
  })
})
