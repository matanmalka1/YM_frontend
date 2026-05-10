import { isAxiosError } from 'axios'
import { toast } from './toast'
import { format, parseISO } from 'date-fns'
import { he } from 'date-fns/locale'
export { getReportingPeriodMonthLabel, MONTH_NAMES, MONTH_OPTIONS } from '@/constants/periodOptions.constants'
// ============================================================================
// STRING & TYPE UTILITIES
// ============================================================================

export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ')
}

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

export const parsePositiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export const isPositiveInt = (value: number | null | undefined): value is number => {
  return value != null && value > 0
}

export const formatClientOfficeId = (value: number | string | null | undefined): string => {
  if (value == null || value === '') return '—'
  return `#${value}`
}

export const formatPlainIdentifier = (value: number | string | null | undefined, fallback = '—'): string => {
  if (value == null || value === '') return fallback
  return String(value)
}

const fmtShekel = (numeric: number): string => {
  const abs = Math.abs(numeric)
  const formatted = `₪${abs.toLocaleString('he-IL')}`
  return numeric < 0 ? `-${formatted}` : formatted
}

export const formatShekelAmount = (value: string | number | null | undefined, fallback = '—'): string => {
  if (value == null || value === '') return fallback
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return fallback
  return fmtShekel(numeric)
}

export const formatBinderNumber = (binderNumber: string | null | undefined): string => {
  if (!binderNumber) return '—'
  const parts = binderNumber.split('/')
  return parts[parts.length - 1]
}

export const formatDate = (value: string | null): string => {
  if (!value) return '—'
  return format(parseISO(value), 'dd/MM/yyyy', { locale: he })
}

export const formatMonthYear = (value: string | null): string => {
  if (!value) return '—'
  return format(parseISO(value), 'MM.yyyy', { locale: he })
}

export const formatDateTime = (value: string | null): string => {
  if (!value) return '—'
  return format(parseISO(value), 'dd/MM/yyyy HH:mm', { locale: he })
}

export const fmtCurrency = (n: string | number | null | undefined): string => {
  if (n == null) return '—'
  const numeric = Number(n)
  if (Number.isNaN(numeric)) return '—'
  const abs = Math.abs(numeric)
  const formatted = `₪${abs.toLocaleString('he-IL', { minimumFractionDigits: 0 })}`
  return numeric < 0 ? `-${formatted}` : formatted
}

const toILSNumeric = (value: string | number | null | undefined): number | null => {
  if (value == null || value === '') return null
  const numeric = Number(value)
  return Number.isNaN(numeric) ? null : numeric
}

export const formatCurrencyILS = (value: string | number | null | undefined, maximumFractionDigits = 0): string => {
  const numeric = toILSNumeric(value)
  if (numeric === null) return '—'
  const abs = Math.abs(numeric)
  const formatted = abs.toLocaleString('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits,
  })
  return numeric < 0 ? `-${formatted}` : formatted
}

export const formatCompactCurrencyILS = (value: string | number | null | undefined, fractionDigits = 2): string => {
  const numeric = toILSNumeric(value)
  if (numeric === null) return '—'
  const abs = Math.abs(numeric)
  const formatted = abs
    .toLocaleString('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })
    .replace(/\s/g, '')
  return numeric < 0 ? `-${formatted}` : formatted
}

export const formatFileSize = (bytes: number | null | undefined): string => {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const getHttpStatus = (error: unknown): number | null => {
  if (!isAxiosError(error)) return null
  const status = error.response?.status
  return typeof status === 'number' ? status : null
}

type ErrorOptions = {
  canonicalAction?: boolean
}

const resolveErrorMessage = (error: unknown, fallbackMessage: string, options?: ErrorOptions): string => {
  if (options?.canonicalAction) {
    const status = getHttpStatus(error)
    if (status === 403) return 'אין הרשאה לבצע פעולה זו'
    if (status === 500) return 'שגיאת שרת פנימית. נסה שוב בעוד מספר רגעים'
  }

  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message ?? '')) {
      return 'הבקשה נמשכה יותר מדי זמן. נסה שוב.'
    }

    const detail = error.response?.data?.detail
    if (typeof detail === 'string' && detail.trim()) return detail.trim()
    if (Array.isArray(detail) && detail.length > 0) {
      const msg = detail[0]?.msg
      if (typeof msg === 'string' && msg.trim()) return msg.trim()
      return fallbackMessage
    }

    if (detail && typeof detail === 'object') {
      const nestedDetail = (detail as { detail?: unknown }).detail
      if (typeof nestedDetail === 'string' && nestedDetail.trim()) {
        return nestedDetail.trim()
      }
    }

    const errorMetaDetail = error.response?.data?.error_meta?.detail
    if (typeof errorMetaDetail === 'string' && errorMetaDetail.trim()) {
      return errorMetaDetail.trim()
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallbackMessage
}

export const getErrorMessage = (error: unknown, fallbackMessage: string, options?: ErrorOptions): string =>
  resolveErrorMessage(error, fallbackMessage, options)

/**
 * Convenience companion to `toast.error(message)`.
 * This is the intentional entry point when the caller has an unknown error
 * object and wants message extraction plus toast display in one step.
 *
 * It returns the resolved message so callers can also surface it inline.
 */
export const showErrorToast = (error: unknown, fallbackMessage: string, options?: ErrorOptions): string => {
  const message = resolveErrorMessage(error, fallbackMessage, options)
  toast.error(message)
  return message
}
