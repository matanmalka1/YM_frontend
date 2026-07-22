// @vitest-environment jsdom
import { createRef } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Select } from './Select'

const options = [
  { value: '', label: 'בחרו' },
  { value: 'enabled', label: 'פעיל' },
  { value: 'disabled', label: 'חסום', disabled: true },
]

afterEach(cleanup)

describe('Select', () => {
  it('forwards its native ref and required constraint', () => {
    const ref = createRef<HTMLSelectElement>()
    render(<Select ref={ref} aria-label="סטטוס" name="status" required defaultValue="" options={options} />)

    expect(ref.current).toBe(screen.getByRole('combobox', { name: 'סטטוס' }))
    expect(ref.current?.checkValidity()).toBe(false)
  })

  it('emits a real native change event and preserves disabled options', () => {
    const onChange = vi.fn()
    render(<Select aria-label="סטטוס" defaultValue="" options={options} onChange={onChange} />)

    const select = screen.getByRole('combobox', { name: 'סטטוס' })
    fireEvent.change(select, { target: { value: 'enabled' } })

    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange.mock.calls[0][0].target).toBe(select)
    expect((screen.getByRole('option', { name: 'חסום' }) as HTMLOptionElement).disabled).toBe(true)
  })

  it('participates in native form submission', () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
    })
    const { container } = render(
      <form onSubmit={onSubmit}>
        <Select aria-label="סטטוס" name="status" defaultValue="enabled" options={options} />
        <button type="submit">שליחה</button>
      </form>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'שליחה' }))
    expect(onSubmit).toHaveBeenCalledOnce()
    expect(new FormData(container.querySelector('form')!).get('status')).toBe('enabled')
  })
})
