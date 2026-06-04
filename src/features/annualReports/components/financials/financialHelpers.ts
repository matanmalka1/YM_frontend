import type { ExpenseCategoryType, FinancialSummaryResponse, IncomeSourceType, TaxCalculationResult } from '../../api'
import { DEFAULT_RECOGNITION_RATE, FINANCIAL_MESSAGES, MAX_PERCENTAGE, MIN_PERCENTAGE } from './financialConstants'
import { EXPENSE_LABELS } from '../../report.constants'

const VAT_EXPENSE_DESC_RE = /^הוצאות ([a-z_]+) — יובא ממע"מ$/

export const normalizeExpenseDescription = (description: string | null | undefined): string | null | undefined => {
  if (!description) return description
  const match = VAT_EXPENSE_DESC_RE.exec(description)
  if (!match) return description
  const key = match[1] as keyof typeof EXPENSE_LABELS
  const label = EXPENSE_LABELS[key] ?? key
  return `${label} — יובא ממע"מ`
}

export interface IncomeFormPayload {
  source_type: IncomeSourceType
  amount: string
  description?: string
}

export interface AddExpensePayload {
  category: ExpenseCategoryType
  amount: string
  description?: string
  recognition_rate?: string
  external_document_reference?: string
}

export const toOptionalText = (value: string): string | undefined => value.trim() || undefined

export const validatePositiveAmount = (amount: string): number | null => {
  const parsed = Number.parseFloat(amount)
  return Number.isNaN(parsed) || parsed <= 0 ? null : parsed
}

export const validatePercentage = (value: string): number | null => {
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) || parsed < MIN_PERCENTAGE || parsed > MAX_PERCENTAGE ? null : parsed
}

export const buildIncomePayload = (
  sourceType: string,
  amount: string,
  description: string,
): { payload?: IncomeFormPayload; error?: string } => {
  if (!sourceType) return { error: FINANCIAL_MESSAGES.chooseType }

  const parsedAmount = validatePositiveAmount(amount)
  if (parsedAmount == null) return { error: FINANCIAL_MESSAGES.positiveAmount }

  return {
    payload: {
      source_type: sourceType as IncomeSourceType,
      amount: String(parsedAmount),
      description: toOptionalText(description),
    },
  }
}

export const buildExpensePayload = (
  category: string,
  amount: string,
  description: string,
  recognitionRate = DEFAULT_RECOGNITION_RATE,
  documentReference = '',
): { payload?: AddExpensePayload; error?: string } => {
  if (!category) return { error: FINANCIAL_MESSAGES.chooseCategory }

  const parsedAmount = validatePositiveAmount(amount)
  if (parsedAmount == null) return { error: FINANCIAL_MESSAGES.positiveAmount }

  const rate = validatePercentage(recognitionRate)
  if (rate == null) return { error: FINANCIAL_MESSAGES.recognitionRate }

  return {
    payload: {
      category: category as ExpenseCategoryType,
      amount: String(parsedAmount),
      description: toOptionalText(description),
      recognition_rate: String(rate),
      external_document_reference: toOptionalText(documentReference),
    },
  }
}

export const getFinancialTotals = (data?: FinancialSummaryResponse) => ({
  income: Number(data?.total_income ?? 0),
  expenses: Number(data?.recognized_expenses ?? data?.gross_expenses ?? 0),
  taxableIncome: Number(data?.taxable_income ?? 0),
})

export const getProfitSummary = (financials: FinancialSummaryResponse, tax: TaxCalculationResult) => {
  const grossIncome = Number(financials.total_income)
  const expenses = Number(financials.recognized_expenses)
  const profitBeforeTax = grossIncome - expenses
  const taxAmount = Number(tax.tax_after_credits)
  const netProfitAfterTax = profitBeforeTax - taxAmount
  const grossMargin = grossIncome > 0 ? profitBeforeTax / grossIncome : 0

  return { grossIncome, expenses, profitBeforeTax, taxAmount, netProfitAfterTax, grossMargin }
}

interface TrendReportInput {
  year: number
}

export interface PLTrendChartRow {
  שנה: number
  הכנסות: number
  הוצאות: number
  רווח: number
  מס: number
}

export const buildTrendChartRows = (
  reports: TrendReportInput[],
  financials: (FinancialSummaryResponse | undefined)[],
  taxes: (TaxCalculationResult | undefined)[],
): PLTrendChartRow[] =>
  reports.flatMap((report, index) => {
    const fin = financials[index]
    const tax = taxes[index]
    if (!fin || !tax) return []

    const income = Number(fin.total_income)
    const expenses = Number(fin.recognized_expenses)

    return [
      {
        שנה: report.year,
        הכנסות: income,
        הוצאות: expenses,
        רווח: income - expenses,
        מס: Number(tax.tax_after_credits),
      },
    ]
  })

export const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

export const toProgressWidth = (value: number) => `${Math.min(Math.max(value * 100, MIN_PERCENTAGE), MAX_PERCENTAGE)}%`

export const getApiErrorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? fallback

export const getApiStatus = (error: unknown) => (error as { response?: { status?: number } })?.response?.status
