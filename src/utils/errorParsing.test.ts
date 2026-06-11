import { describe, expect, it } from 'vitest'

import { getApiErrorBody, getErrorMessage } from './utils'

const axiosError = (status: number, data: unknown): unknown => ({
  isAxiosError: true,
  message: 'Request failed',
  response: { status, data },
})

describe('API error parsing', () => {
  it('parses the standard error envelope', () => {
    const error = axiosError(409, {
      error: {
        code: 'client_has_open_binder',
        message: 'ללקוח כבר קיים קלסר פתוח',
        details: { client_id: 123 },
        request_id: 'req-1',
      },
    })

    expect(getApiErrorBody(error)).toEqual({
      code: 'client_has_open_binder',
      message: 'ללקוח כבר קיים קלסר פתוח',
      details: { client_id: 123 },
      request_id: 'req-1',
    })
    expect(getErrorMessage(error, 'fallback')).toBe('ללקוח כבר קיים קלסר פתוח')
  })

  it('falls back to legacy detail strings', () => {
    const error = axiosError(400, { detail: 'הבקשה אינה תקינה' })

    expect(getApiErrorBody(error)).toBeNull()
    expect(getErrorMessage(error, 'fallback')).toBe('הבקשה אינה תקינה')
  })

  it('handles unknown response shapes safely', () => {
    const error = axiosError(400, { unexpected: true })

    expect(getApiErrorBody(error)).toBeNull()
    expect(getErrorMessage(error, 'fallback')).toBe('fallback')
  })
})
