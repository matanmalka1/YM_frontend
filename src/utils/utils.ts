import { isAxiosError } from 'axios'
import { clsx, type ClassValue } from 'clsx'
import { format, isValid, parseISO } from 'date-fns'
import { he } from 'date-fns/locale'
import { twMerge } from 'tailwind-merge'
import { toast } from './toast'

export {
  getReportingPeriodLabelWithYear,
  getReportingPeriodMonthLabel,
  MONTH_NAMES,
  MONTH_OPTIONS,
} from '@/constants/periodOptions.constants'

const EMPTY_VALUE = '—'

export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs))
}

export const parsePositiveInt = (value: string | null, fallback: number): number => {
  const normalized = value?.trim()
  if (!normalized || !/^\d+$/.test(normalized)) return fallback

  const parsed = Number(normalized)
  return parsed > 0 ? parsed : fallback
}

export const isPositiveInt = (value: number | null | undefined): value is number => {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

export const formatClientOfficeId = (value: number | string | null | undefined): string => {
  if (value == null || value === '') return EMPTY_VALUE
  return String(value)
}

export const formatPlainIdentifier = (value: number | string | null | undefined, fallback = EMPTY_VALUE): string => {
  if (value == null || value === '') return fallback
  return String(value)
}

export const formatPhoneNumber = (value: string | null | undefined, fallback = EMPTY_VALUE): string => {
  const raw = value?.trim()
  if (!raw) return fallback

  const digits = raw.replace(/\D/g, '')

  if (digits.length === 10 && digits.startsWith('0')) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }

  if (digits.length === 9 && digits.startsWith('0')) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`
  }

  return raw
}

const toNumberOrNull = (value: string | number | null | undefined): number | null => {
  if (value == null || value === '') return null

  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

type CurrencyFormatOptions = {
  compact?: boolean
  fallback?: string
  fractionDigits?: number
  maximumFractionDigits?: number
  minimumFractionDigits?: number
}

export const formatCurrencyILS = (
  value: string | number | null | undefined,
  options: CurrencyFormatOptions = { maximumFractionDigits: 0 },
): string => {
  const numeric = toNumberOrNull(value)
  if (numeric === null) return options.fallback ?? EMPTY_VALUE

  const fractionDigits = options.fractionDigits
  const minimumFractionDigits = options.minimumFractionDigits ?? fractionDigits
  const maximumFractionDigits = options.maximumFractionDigits ?? fractionDigits ?? 0

  const formatted = new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numeric)

  return options.compact ? formatted.replace(/\s/g, '') : formatted
}

export const formatShekelAmount = (value: string | number | null | undefined, fallback = EMPTY_VALUE): string => {
  return formatCurrencyILS(value, { fallback, maximumFractionDigits: 0 })
}

/** Locale-grouped integer count (e.g. `1,234`). For currency use formatCurrencyILS, for ratios formatPercent. */
export const formatCount = (value: string | number | null | undefined, fallback = EMPTY_VALUE): string => {
  const numeric = toNumberOrNull(value)
  if (numeric === null) return fallback
  return new Intl.NumberFormat('he-IL', { maximumFractionDigits: 0 }).format(numeric)
}

type PercentFormatOptions = {
  fallback?: string
  fractionDigits?: number
  // Set when value is a 0–1 ratio that must be scaled to 0–100 before display.
  isRatio?: boolean
}

export const formatPercent = (
  value: string | number | null | undefined,
  options: PercentFormatOptions = {},
): string => {
  const numeric = toNumberOrNull(value)
  if (numeric === null) return options.fallback ?? EMPTY_VALUE

  const percent = options.isRatio ? numeric * 100 : numeric
  const fractionDigits = options.fractionDigits ?? 1

  const formatted = new Intl.NumberFormat('he-IL', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(percent)

  return `${formatted}%`
}

export const formatBinderNumber = (binderNumber: string | null | undefined): string => {
  if (!binderNumber) return EMPTY_VALUE
  return binderNumber
}

const formatSafeDate = (value: string | null | undefined, pattern: string, fallback = EMPTY_VALUE): string => {
  if (!value) return fallback

  const date = parseISO(value)
  if (!isValid(date)) return fallback

  return format(date, pattern, { locale: he })
}

export const formatDate = (value: string | null | undefined): string => {
  return formatSafeDate(value, 'dd/MM/yyyy')
}

export const formatMonthYear = (value: string | null | undefined): string => {
  return formatSafeDate(value, 'MM.yyyy')
}

export const formatDateTime = (value: string | null | undefined): string => {
  return formatSafeDate(value, 'dd/MM/yyyy HH:mm')
}

export const formatAuditTimestamp = (value: string | null | undefined): string => {
  return formatSafeDate(value, 'd MMM yyyy HH:mm')
}

export const formatHebrewDate = (d: Date): string => format(d, 'EEEE, d בMMMM', { locale: he })

export const formatWeekday = (value: string | null | undefined): string => {
  return formatSafeDate(value, 'EEEE')
}

export const formatFileSize = (bytes: number | null | undefined): string => {
  if (bytes == null || !Number.isFinite(bytes)) return EMPTY_VALUE
  if (bytes < 0) return EMPTY_VALUE

  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export const getHttpStatus = (error: unknown): number | null => {
  if (!isAxiosError(error)) return null

  const status = error.response?.status
  return typeof status === 'number' ? status : null
}

export type ApiErrorBody = {
  code: string
  message: string
  details?: unknown
  request_id?: string | null
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const isApiErrorBody = (value: unknown): value is ApiErrorBody => {
  if (!isRecord(value)) return false
  return typeof value.code === 'string' && typeof value.message === 'string'
}

export const getApiErrorBody = (error: unknown): ApiErrorBody | null => {
  if (!isAxiosError(error)) return null

  const data = error.response?.data
  if (!isRecord(data)) return null

  return isApiErrorBody(data.error) ? data.error : null
}

const getLegacyDetailMessage = (error: unknown): string | null => {
  if (!isAxiosError(error)) return null

  const data = error.response?.data
  if (!isRecord(data)) return null

  return typeof data.detail === 'string' ? data.detail : null
}

const containsHebrew = (value: string): boolean => /[֐-׿]/.test(value)

const isSafeBackendMessage = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && containsHebrew(value)

const messageForStatus = (status: number, fallback: string): string => {
  if (status === 403) return 'אין הרשאה לבצע פעולה זו'
  if (status === 404) return 'הנתון המבוקש לא נמצא'
  if (status === 422) return fallback
  if (status === 429) return 'יותר מדי ניסיונות. נסה שוב בעוד כמה דקות'
  if (status >= 500) return 'שגיאת שרת פנימית. נסה שוב בעוד מספר רגעים'
  return fallback
}

const resolveErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message ?? '')) {
      return 'הבקשה נמשכה יותר מדי זמן. נסה שוב.'
    }

    if (error.code === 'ERR_NETWORK' || (!error.response && error.request)) {
      return 'אין חיבור לשרת. בדוק את החיבור שלך ונסה שוב.'
    }

    if (error.response) {
      const status = error.response.status
      const backendMessage = getApiErrorBody(error)?.message ?? getLegacyDetailMessage(error)
      if (isSafeBackendMessage(backendMessage) && status !== 422) {
        return backendMessage.trim()
      }
      return messageForStatus(status, fallbackMessage)
    }
  }

  return fallbackMessage
}

export const getErrorMessage = (error: unknown, fallbackMessage: string): string => {
  return resolveErrorMessage(error, fallbackMessage)
}

export const showErrorToast = (error: unknown, fallbackMessage: string): string => {
  const message = resolveErrorMessage(error, fallbackMessage)
  toast.error(message)
  return message
}
