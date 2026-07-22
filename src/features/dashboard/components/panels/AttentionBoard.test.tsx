// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { AttentionBoard } from './AttentionBoard'

afterEach(cleanup)

describe('AttentionBoard', () => {
  it('links the expanded queue action to the routed work queue', () => {
    render(
      <MemoryRouter>
        <AttentionBoard
          total={2}
          items={[
            {
              id: 'vat-1',
              source_type: 'vat_work_item',
              source_id: 1,
              title: 'דוח מע״מ',
              href: '/vat/1',
              urgency: 'approaching',
              days_delta: 2,
              due_date: '2026-07-24',
              client_name: 'לקוח',
              reason: null,
              amount: null,
            },
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /הצג/ }).getAttribute('href')).toBe('/work-queue')
  })
})
