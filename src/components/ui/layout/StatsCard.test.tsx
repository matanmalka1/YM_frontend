// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StatsCard } from './StatsCard'

afterEach(cleanup)

describe('StatsCard', () => {
  it('renders static and loading values without synchronized animation state', () => {
    const { rerender } = render(<StatsCard title="לקוחות" value={1234} description="פעילים" />)
    expect(screen.getByText('1,234')).toBeTruthy()
    rerender(<StatsCard title="לקוחות" value={1234} loading />)
    expect(screen.getByText('—')).toBeTruthy()
  })

  it('uses button semantics only for interactive cards', () => {
    const onClick = vi.fn()
    const { rerender } = render(<StatsCard title="לבחירה" value={2} selected onClick={onClick} />)
    const button = screen.getByRole('button', { name: /לבחירה/ })
    expect(button.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()

    rerender(<StatsCard title="סטטי" value={2} />)
    expect(screen.queryByRole('button')).toBeNull()
  })
})
