import type { VatInvoiceResponse } from '../api'
import { CATEGORY_TABLE_LABELS } from '../constants/vatConstants'

export interface ExpenseCategoryRow {
  categoryKey: string
  label: string
  deductionRate: number
  netAmount: number
  grossVat: number
  deductibleVat: number
}

export interface VatBreakdownData {
  totalIncomeNet: number
  totalOutputVat: number
  expenseRows: ExpenseCategoryRow[]
  totalExpenseNet: number
  totalGrossVat: number
  totalInputVat: number
}

export const computeVatBreakdown = (
  invoices: VatInvoiceResponse[],
  totalOutputVat: string | number,
  totalInputVat: string | number,
): VatBreakdownData => {
  const income = invoices.filter((i) => i.invoice_type === 'income')
  const expense = invoices.filter((i) => i.invoice_type === 'expense')

  const totalIncomeNet = income.reduce((s, i) => s + Number(i.net_amount), 0)

  const grouped: Record<string, { net: number; deductible: number; grossVat: number }> = {}
  for (const inv of expense) {
    const key = inv.expense_category ?? 'other'
    if (!grouped[key]) grouped[key] = { net: 0, deductible: 0, grossVat: 0 }
    const rate = Number(inv.deduction_rate)
    const deductible = Number(inv.vat_amount)
    const gross = rate > 0 ? deductible / rate : deductible
    grouped[key].net += Number(inv.net_amount)
    grouped[key].deductible += deductible
    grouped[key].grossVat += gross
  }

  const expenseRows: ExpenseCategoryRow[] = Object.entries(grouped).map(([key, val]) => {
    const deductionRate = val.grossVat > 0 ? val.deductible / val.grossVat : 0
    return {
      categoryKey: key,
      label: CATEGORY_TABLE_LABELS[key] ?? key,
      deductionRate,
      netAmount: val.net,
      grossVat: val.grossVat,
      deductibleVat: val.deductible,
    }
  })

  const totalExpenseNet = expenseRows.reduce((s, r) => s + r.netAmount, 0)
  const totalGrossVat = expenseRows.reduce((s, r) => s + r.grossVat, 0)

  return {
    totalIncomeNet,
    totalOutputVat: Number(totalOutputVat),
    expenseRows,
    totalExpenseNet,
    totalGrossVat,
    totalInputVat: Number(totalInputVat),
  }
}
