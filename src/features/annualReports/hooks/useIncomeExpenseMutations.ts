import { useMutation, useQueryClient } from '@tanstack/react-query'
import { annualReportFinancialsApi, annualReportsQK } from '../api'
import type { ExpenseLinePayload, ExpenseLineResponse, IncomeLinePayload, IncomeLineResponse } from '../api'
import { EXPENSE_LABELS, INCOME_LABELS } from '../constants/reportConstants'
import { toast } from '../../../utils/toast'
import { formatCurrencyILS, showErrorToast } from '../../../utils/utils'

const incomeToast = (verb: string, line: IncomeLineResponse) => {
  const label = INCOME_LABELS[line.source_type] ?? line.source_type
  const desc = line.description ? ` — ${line.description}` : ''
  toast.success(`${verb}: ${label}${desc} | ${formatCurrencyILS(line.amount)}`)
}

const expenseToast = (verb: string, line: ExpenseLineResponse) => {
  const label = EXPENSE_LABELS[line.category] ?? line.category
  const rate = Math.round(Number(line.recognition_rate) * 100)
  const desc = line.description ? ` — ${line.description}` : ''
  const suffix = ` | ${formatCurrencyILS(line.amount)} (הכרה ${rate}%)`
  const recognized = line.recognized_amount !== line.amount ? ` → ${formatCurrencyILS(line.recognized_amount)}` : ''
  toast.success(`${verb}: ${label}${desc}${suffix}${recognized}`)
}

export const useIncomeExpenseMutations = (reportId: number) => {
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: annualReportsQK.financials(reportId) })
    void queryClient.invalidateQueries({ queryKey: annualReportsQK.readiness(reportId) })
    void queryClient.invalidateQueries({ queryKey: annualReportsQK.detail(reportId) })
  }

  const addIncome = useMutation({
    mutationFn: (payload: IncomeLinePayload) => annualReportFinancialsApi.addIncomeLine(reportId, payload),
    onSuccess: (line) => {
      incomeToast('הכנסה נוספה', line)
      invalidate()
    },
    onError: (err) => showErrorToast(err, 'שגיאה בהוספת הכנסה'),
  })

  const deleteIncome = useMutation({
    mutationFn: (line: IncomeLineResponse) => annualReportFinancialsApi.deleteIncomeLine(reportId, line.id),
    onSuccess: (_, line) => {
      incomeToast('הכנסה נמחקה', line)
      invalidate()
    },
    onError: (err) => showErrorToast(err, 'שגיאה במחיקת הכנסה'),
  })

  const addExpense = useMutation({
    mutationFn: (payload: ExpenseLinePayload) =>
      annualReportFinancialsApi.addExpenseLine(reportId, {
        category: payload.category,
        amount: String(payload.amount),
        description: payload.description,
        recognition_rate: payload.recognition_rate != null ? String(payload.recognition_rate) : undefined,
        external_document_reference: payload.external_document_reference,
      }),
    onSuccess: (line) => {
      expenseToast('הוצאה נוספה', line)
      invalidate()
    },
    onError: (err) => showErrorToast(err, 'שגיאה בהוספת הוצאה'),
  })

  const updateIncome = useMutation({
    mutationFn: ({ lineId, payload }: { lineId: number; payload: Partial<IncomeLinePayload> }) =>
      annualReportFinancialsApi.updateIncomeLine(reportId, lineId, payload),
    onSuccess: (line) => {
      incomeToast('הכנסה עודכנה', line)
      invalidate()
    },
    onError: (err) => showErrorToast(err, 'שגיאה בעדכון הכנסה'),
  })

  const updateExpense = useMutation({
    mutationFn: ({ lineId, payload }: { lineId: number; payload: Partial<ExpenseLinePayload> }) =>
      annualReportFinancialsApi.updateExpenseLine(reportId, lineId, payload),
    onSuccess: (line) => {
      expenseToast('הוצאה עודכנה', line)
      invalidate()
    },
    onError: (err) => showErrorToast(err, 'שגיאה בעדכון הוצאה'),
  })

  const deleteExpense = useMutation({
    mutationFn: (line: ExpenseLineResponse) => annualReportFinancialsApi.deleteExpenseLine(reportId, line.id),
    onSuccess: (_, line) => {
      expenseToast('הוצאה נמחקה', line)
      invalidate()
    },
    onError: (err) => showErrorToast(err, 'שגיאה במחיקת הוצאה'),
  })

  return { addIncome, deleteIncome, addExpense, updateIncome, updateExpense, deleteExpense }
}
