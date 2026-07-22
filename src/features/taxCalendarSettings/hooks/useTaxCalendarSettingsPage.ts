import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { getErrorMessage, getHttpStatus } from '@/utils/utils'
import { getOperationalYearOptions } from '@/constants/periodOptions.constants'
import { taxCalendarSettingsApi, taxCalendarSettingsQK } from '../api'
import { TAX_CALENDAR_SETTINGS_ERROR_MESSAGES } from '../errorMessages'
import { TAX_CALENDAR_SETTINGS_MESSAGES } from '../messages'
import { translateTaxCalendarWarning } from '../utils/warnings'
import { getDefaultYearRange, groupTaxCalendarEntries, parseYearInput } from '../utils/settings'

export const useTaxCalendarSettingsPage = () => {
  const defaults = useMemo(getDefaultYearRange, [])
  const [startYear, setStartYear] = useState(defaults.startYear)
  const [endYear, setEndYear] = useState(defaults.endYear)
  const start = parseYearInput(startYear, TAX_CALENDAR_SETTINGS_MESSAGES.labels.startYear)
  const end = parseYearInput(endYear, TAX_CALENDAR_SETTINGS_MESSAGES.labels.endYear)
  const hasInvalidRange = start.value !== null && end.value !== null && start.value > end.value
  const params =
    start.value !== null && end.value !== null && !hasInvalidRange
      ? { tax_year_after: start.value, tax_year_before: end.value }
      : null

  const rulesQuery = useQuery({ queryKey: taxCalendarSettingsQK.rules(), queryFn: taxCalendarSettingsApi.listRules })
  const entriesQuery = useQuery({
    queryKey: taxCalendarSettingsQK.entries(params),
    queryFn: () => taxCalendarSettingsApi.listEntries(params!),
    enabled: params !== null,
  })
  const summaryQuery = useQuery({
    queryKey: taxCalendarSettingsQK.summary(params),
    queryFn: () => taxCalendarSettingsApi.getSummary(params!),
    enabled: params !== null,
  })
  const bootstrap = useMutationWithToast({
    mutationFn: taxCalendarSettingsApi.bootstrap,
    successMessage: (result) => `יומן המס אותחל: ${result.entries_created} רשומות נוצרו, ${result.entries_skipped} רשומות דולגו.`,
    errorMessage: TAX_CALENDAR_SETTINGS_ERROR_MESSAGES.bootstrap,
    invalidateKeys: [taxCalendarSettingsQK.all],
  })
  const allErrors = [rulesQuery.error, entriesQuery.error, summaryQuery.error]
  const denied = allErrors.some((error) => getHttpStatus(error) === 403)
  const warnings = (summaryQuery.data?.warnings ?? []).map(translateTaxCalendarWarning)
  const bootstrapWarnings = (bootstrap.data?.warnings ?? []).map(translateTaxCalendarWarning)
  const yearOptions = useMemo(() => {
    const options = getOperationalYearOptions()
    const nextYear = String(new Date().getFullYear() + 1)
    return options.some((option) => option.value === nextYear) ? options : [{ value: nextYear, label: nextYear }, ...options]
  }, [])

  return {
    denied,
    filters: {
      startYear,
      endYear,
      startYearError: start.error,
      endYearError: end.error,
      hasInvalidRange,
      isLoadable: params !== null,
      yearOptions,
      setStartYear,
      setEndYear,
      reset: () => {
        setStartYear(defaults.startYear)
        setEndYear(defaults.endYear)
      },
    },
    stats: {
      yearRange: `${start.value ?? '—'}–${end.value ?? '—'}`,
      totalEntries: summaryQuery.data?.total_entries ?? 0,
      warnings,
      isLoading: summaryQuery.isPending,
      error: summaryQuery.isError ? getErrorMessage(summaryQuery.error, TAX_CALENDAR_SETTINGS_ERROR_MESSAGES.load.summary) : null,
    },
    rules: {
      data: rulesQuery.data ?? [],
      isLoading: rulesQuery.isPending,
      error: rulesQuery.isError ? getErrorMessage(rulesQuery.error, TAX_CALENDAR_SETTINGS_ERROR_MESSAGES.load.rules) : null,
    },
    entries: {
      groups: groupTaxCalendarEntries(entriesQuery.data ?? []),
      isLoading: entriesQuery.isPending,
      error: entriesQuery.isError ? getErrorMessage(entriesQuery.error, TAX_CALENDAR_SETTINGS_ERROR_MESSAGES.load.entries) : null,
    },
    bootstrap: {
      run: () => params && bootstrap.mutate(params),
      isLoading: bootstrap.isPending,
      result: bootstrap.data ?? null,
      warnings: bootstrapWarnings,
    },
  }
}
