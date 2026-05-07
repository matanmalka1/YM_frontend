import { calculateDaysRemaining } from './api'
import type { TaxDeadlineResponse } from './api'
import { getReportingPeriodMonthLabel, MONTH_NAMES } from '@/constants/periodOptions.constants'
import type { CreateTaxDeadlineForm, EditTaxDeadlineForm } from './types'

type DeadlinePeriodFields = Pick<TaxDeadlineResponse, 'deadline_type' | 'period' | 'period_months_count' | 'tax_year'>
type CoveredDeadlinePeriod = Pick<TaxDeadlineResponse, 'period' | 'period_months_count'>

export const isAnnualReportDeadline = (deadlineType: string) => deadlineType === 'annual_report'

export const getCurrentTaxYear = () => new Date().getFullYear()

export const getSelectedTaxYear = (period: string) => Number(period || getCurrentTaxYear())

export const toDeadlinePayloadPeriod = (
  values: Pick<CreateTaxDeadlineForm | EditTaxDeadlineForm, 'deadline_type' | 'period'>,
) => (isAnnualReportDeadline(values.deadline_type) ? null : values.period || null)

export const toDeadlinePayloadTaxYear = (
  values: Pick<CreateTaxDeadlineForm | EditTaxDeadlineForm, 'deadline_type' | 'period'>,
) => (isAnnualReportDeadline(values.deadline_type) ? getSelectedTaxYear(values.period) : null)

export const getDeadlineDaysLabel = (
  dueDate: string,
  inactive: boolean,
): { daysRemaining: number; daysLabel: string } => {
  const daysRemaining = calculateDaysRemaining(dueDate)

  if (inactive) return { daysRemaining, daysLabel: '—' }

  const daysLabel =
    daysRemaining < 0
      ? `באיחור ${Math.abs(daysRemaining)} ימים`
      : daysRemaining === 0
        ? 'היום'
        : daysRemaining === 1
          ? 'מחר'
          : `בעוד ${daysRemaining} ימים`

  return { daysRemaining, daysLabel }
}

export const getDeadlineDaysLabelShort = (daysRemaining: number, inactive: boolean): string => {
  if (inactive) return '—'
  if (daysRemaining < 0) return `באיחור ${Math.abs(daysRemaining)} ימים`
  if (daysRemaining === 0) return 'היום'
  if (daysRemaining === 1) return 'מחר'
  return `בעוד ${daysRemaining} ימים`
}

export const getTaxDeadlinePeriodLabel = (deadline: DeadlinePeriodFields): string => {
  if (isAnnualReportDeadline(deadline.deadline_type)) {
    return deadline.tax_year != null ? `שנת ${deadline.tax_year}` : 'ללא תקופה'
  }

  if (!deadline.period) return 'ללא תקופה'

  const periodMatch = /^(\d{4})-(\d{2})$/.exec(deadline.period)
  if (!periodMatch) return deadline.period

  const year = periodMatch[1]
  const periodMonthsCount = deadline.period_months_count ?? 1
  const month = getReportingPeriodMonthLabel(deadline.period, periodMonthsCount)

  return month ? `${month} ${year}` : deadline.period
}

export const getTaxDeadlineCoveredPeriodsLabel = (
  deadlineType: string,
  periods: CoveredDeadlinePeriod[],
): string | null => {
  const labels = [...periods]
    .sort((a, b) => {
      const monthsDiff = (b.period_months_count ?? 1) - (a.period_months_count ?? 1)
      if (monthsDiff !== 0) return monthsDiff
      return (a.period ?? '').localeCompare(b.period ?? '')
    })
    .map((period) =>
      getTaxDeadlinePeriodLabel({
        deadline_type: deadlineType,
        period: period.period,
        period_months_count: period.period_months_count,
        tax_year: null,
      }),
    )
    .filter((label, index, allLabels) => allLabels.indexOf(label) === index)

  return labels.length ? `כולל תקופות: ${labels.join(', ')}` : null
}

export const getTaxDeadlineMonthGroupKey = (dueDate: string): string => {
  const [year, month] = dueDate.split('-')
  return `${year}-${month}`
}

export const getTaxDeadlineMonthGroupLabel = (key: string): string => {
  const [year, month] = key.split('-')
  const monthName = MONTH_NAMES[Number(month) - 1] ?? month
  return `${monthName} ${year}`
}

export const groupTaxDeadlinesByMonth = (deadlines: TaxDeadlineResponse[]) => {
  const groups = new Map<string, TaxDeadlineResponse[]>()

  for (const deadline of deadlines) {
    const key = getTaxDeadlineMonthGroupKey(deadline.due_date)
    groups.set(key, [...(groups.get(key) ?? []), deadline])
  }

  return Array.from(groups.entries()).map(([key, items]) => ({
    key,
    label: getTaxDeadlineMonthGroupLabel(key),
    items,
  }))
}

export const findMatchingDuplicateDeadline = (
  deadlines: TaxDeadlineResponse[],
  values: Pick<CreateTaxDeadlineForm, 'deadline_type' | 'period'>,
  excludeId?: number,
) =>
  deadlines.find((deadline) => {
    if (deadline.id === excludeId) return false
    if (!isAnnualReportDeadline(values.deadline_type)) return deadline.period === values.period
    return deadline.tax_year === getSelectedTaxYear(values.period)
  }) ?? null
