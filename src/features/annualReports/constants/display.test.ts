import { describe, expect, it } from 'vitest'
import { CLIENT_TYPE_OPTIONS } from './sharedConstants'
import { CLIENT_TYPE_LABELS, STATUS_LABELS } from './display'
import { SEASON_PROGRESS_STAGES } from '../components/season/seasonProgressConfig'

describe('annual report presentation maps', () => {
  it('derives every season stage from the canonical status labels', () => {
    expect(SEASON_PROGRESS_STAGES.map((stage) => stage.key)).toEqual(Object.keys(STATUS_LABELS))
    expect(SEASON_PROGRESS_STAGES.map((stage) => stage.label)).toEqual(Object.values(STATUS_LABELS))
  })

  it('derives every form client-type option from the canonical short map', () => {
    expect(CLIENT_TYPE_OPTIONS.map((option) => option.value)).toEqual(Object.keys(CLIENT_TYPE_LABELS))
    expect(CLIENT_TYPE_OPTIONS.every((option) => option.label.includes('טופס'))).toBe(true)
  })
})
