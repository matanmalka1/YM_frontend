import { describe, expect, it } from 'vitest'
import {
  getSelectDropdownDisplay,
  getSelectDropdownOptionId,
  type SelectDropdownOption,
} from './SelectDropdown.helpers'

const options: SelectDropdownOption[] = [
  { value: 'active', label: 'פעיל' },
  { value: 'inactive', label: 'לא פעיל' },
]

describe('SelectDropdown helpers', () => {
  it('uses the placeholder when the current value is empty and no empty option exists', () => {
    expect(getSelectDropdownDisplay(options, '', 'בחר...')).toEqual({
      label: 'בחר...',
      isPlaceholder: true,
    })
  })

  it('uses the explicit empty option label instead of the placeholder', () => {
    expect(
      getSelectDropdownDisplay([{ value: '', label: 'כל העסקים' }, ...options], '', 'בחר...'),
    ).toEqual({
      label: 'כל העסקים',
      isPlaceholder: false,
    })
  })

  it('uses the matching option label for a known value', () => {
    expect(getSelectDropdownDisplay(options, 'active', 'בחר...')).toEqual({
      label: 'פעיל',
      isPlaceholder: false,
    })
  })

  it('keeps an unmatched controlled value visible instead of showing the placeholder', () => {
    expect(getSelectDropdownDisplay(options, 'archived', 'בחר...')).toEqual({
      label: 'archived',
      isPlaceholder: false,
    })
  })

  it('builds stable option ids from the owning listbox id', () => {
    expect(getSelectDropdownOptionId('status-listbox', 2)).toBe('status-listbox-option-2')
  })
})
