import { useMutation, useQueryClient } from '@tanstack/react-query'
import { annualReportFinancialsApi, annualReportsQK } from '../api'
import type { ExpenseLinePayload, IncomeLinePayload, IncomeSourceType } from '../api'
import { toast } from '../../../utils/toast'
import { showErrorToast } from '../../../utils/utils'

export const useIncomeExpenseMutations = (reportId: number) => {
  const queryClient = useQueryClient()

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: annualReportsQK.financials(reportId) })
    void queryClient.invalidateQueries({ queryKey: annualReportsQK.readiness(reportId) })
    void queryClient.invalidateQueries({ queryKey: annualReportsQK.detail(reportId) })
  }

  const addIncome = useMutation({
    mutationFn: ({ type_key, amount, description }: { type_key: string; amount: number; description?: string }) =>
      annualReportFinancialsApi.addIncomeLine(reportId, {
        source_type: type_key as IncomeSourceType,
        amount: String(amount),
        description,
      }),
    onSuccess: () => {
      toast.success('הכנסה נוספה')
      invalidate()
    },
    onError: (err) => showErrorToast(err, 'שגיאה בהוספת הכנסה'),
  })

  const deleteIncome = useMutation({
    mutationFn: (lineId: number) => annualReportFinancialsApi.deleteIncomeLine(reportId, lineId),
    onSuccess: () => {
      toast.success('הכנסה נמחקה')
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
    onSuccess: () => {
      toast.success('הוצאה נוספה')
      invalidate()
    },
    onError: (err) => showErrorToast(err, 'שגיאה בהוספת הוצאה'),
  })

  const updateIncome = useMutation({
    mutationFn: ({ lineId, payload }: { lineId: number; payload: Partial<IncomeLinePayload> }) =>
      annualReportFinancialsApi.updateIncomeLine(reportId, lineId, payload),
    onSuccess: () => {
      toast.success('הכנסה עודכנה')
      invalidate()
    },
    onError: (err) => showErrorToast(err, 'שגיאה בעדכון הכנסה'),
  })

  const updateExpense = useMutation({
    mutationFn: ({ lineId, payload }: { lineId: number; payload: Partial<ExpenseLinePayload> }) =>
      annualReportFinancialsApi.updateExpenseLine(reportId, lineId, payload),
    onSuccess: () => {
      toast.success('הוצאה עודכנה')
      invalidate()
    },
    onError: (err) => showErrorToast(err, 'שגיאה בעדכון הוצאה'),
  })

  const deleteExpense = useMutation({
    mutationFn: (lineId: number) => annualReportFinancialsApi.deleteExpenseLine(reportId, lineId),
    onSuccess: () => {
      toast.success('הוצאה נמחקה')
      invalidate()
    },
    onError: (err) => showErrorToast(err, 'שגיאה במחיקת הוצאה'),
  })

  return { addIncome, deleteIncome, addExpense, updateIncome, updateExpense, deleteExpense }
}
