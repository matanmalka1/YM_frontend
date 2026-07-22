import { describe, expect, it } from 'vitest'
import { taskLinkableSourceListSchema, taskListResponseSchema } from './contracts'

describe('task API contracts', () => {
  it('accepts enriched task rows and server aggregate counts', () => {
    const parsed = taskListResponseSchema.parse({
      items: [
        {
          id: 1,
          title: 'בדיקה',
          status: 'open',
          priority: 'normal',
          assigned_to_user_name: 'נועה',
          client_name: 'ישראל ישראלי',
          created_at: '2026-07-22T10:00:00Z',
          updated_at: '2026-07-22T10:00:00Z',
        },
      ],
      page: 1,
      page_size: 20,
      total: 1,
      summary: { total: 3, open: 1, done: 1, canceled: 1 },
    })

    expect(parsed.items[0].assigned_to_user_name).toBe('נועה')
    expect(parsed.summary.done).toBe(1)
  })

  it('validates linkable work item sources', () => {
    expect(
      taskLinkableSourceListSchema.parse({
        items: [
          {
            source_domain: 'annual_report',
            source_id: 7,
            title: 'דוח שנתי 2025',
            linked_tasks_count: 1,
          },
        ],
        page: 1,
        page_size: 100,
        total: 1,
      }).items[0].source_domain,
    ).toBe('annual_report')
  })
})
