// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { WorkQueueStatsSection } from './WorkQueueStatsSection'

const summary = {
  total: 12,
  manual_tasks: 3,
  linked: 4,
  unlinked: 8,
  overdue: 2,
  approaching: 3,
  important: 4,
  upcoming: 3,
  by_source_type: {
    vat_work_item: 2,
    annual_report: 2,
    advance_payment: 2,
    charge: 2,
    binder: 1,
    task: 3,
  },
  by_task_status: { open: 7, done: 0, canceled: 0 },
}

describe('WorkQueueStatsSection', () => {
  it('turns urgency cards into toggleable filters and exposes queue composition', () => {
    const onUrgencyChange = vi.fn()
    render(<WorkQueueStatsSection summary={summary} activeUrgency="overdue" onUrgencyChange={onUrgencyChange} />)

    fireEvent.click(screen.getByRole('button', { name: /באיחור/ }))
    fireEvent.click(screen.getByRole('button', { name: /דחוף/ }))

    expect(onUrgencyChange).toHaveBeenNthCalledWith(1, null)
    expect(onUrgencyChange).toHaveBeenNthCalledWith(2, 'approaching')
    expect(screen.getByText('עבודה מערכתית')).toBeTruthy()
    expect(screen.getByText('משימות ידניות')).toBeTruthy()
  })
})
