import { describe, expect, it } from 'vitest'
import { buildExpensePayload, formatRecognitionRate } from './financialHelpers'

describe('annual report expense payloads', () => {
  it('omits an untouched recognition rate so the backend category default applies', () => {
    expect(buildExpensePayload('vehicle', '1000', '', '').payload).toEqual({
      category: 'vehicle',
      amount: '1000',
      description: undefined,
      external_document_reference: undefined,
    })
  })

  it('preserves an explicit recognition override as a ratio', () => {
    expect(buildExpensePayload('vehicle', '1000', '', '75').payload?.recognition_rate).toBe('0.75')
  })

  it.each([
    [0, '0%'],
    [0.75, '75%'],
    [0.8, '80%'],
    [1, '100%'],
  ])('formats the backend ratio %s as %s', (ratio, expected) => {
    expect(formatRecognitionRate(ratio)).toBe(expected)
  })
})
