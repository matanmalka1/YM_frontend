import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRole } from '@/hooks/useRole'
import { getErrorMessage, getHttpStatus } from '@/utils/utils'
import { toast } from '@/utils/toast'
import {
  annualReportFinancialsApi,
  annualReportsQK,
  type ExpenseLinePayload,
  type ExpenseLineResponse,
  type IncomeLinePayload,
  type IncomeLineResponse,
} from '../api'
import { FINANCIAL_MESSAGES } from '../constants/financialConstants'
import { getFinancialTotals, type IncomeFormPayload } from '../utils/financialHelpers'
import { useIncomeExpenseMutations } from './useIncomeExpenseMutations'

type EditingLine = { type: 'income' | 'expense'; id: number } | null

export const useIncomeExpenseTab = (reportId: number) => {
  const queryClient = useQueryClient()
  const { isAdvisor } = useRole()
  const [editingLine, setEditingLine] = useState<EditingLine>(null)
  const [showForceConfirm, setShowForceConfirm] = useState(false)
  const [deletingIncomeIds, setDeletingIncomeIds] = useState<Set<number>>(() => new Set())
  const [deletingExpenseIds, setDeletingExpenseIds] = useState<Set<number>>(() => new Set())
  const [autoPopulateResult, setAutoPopulateResult] = useState<Awaited<
    ReturnType<typeof annualReportFinancialsApi.autoPopulate>
  > | null>(null)

  const { data: financialsData, isLoading: financialsLoading } = useQuery({
    queryKey: annualReportsQK.financials(reportId),
    queryFn: () => annualReportFinancialsApi.getFinancials(reportId),
    enabled: reportId > 0,
  })

  const mutations = useIncomeExpenseMutations(reportId)

  const clearAutoPopulateResult = () => setAutoPopulateResult(null)

  const autoPopulateMutation = useMutation({
    mutationFn: (force: boolean) => annualReportFinancialsApi.autoPopulate(reportId, force),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: annualReportsQK.financials(reportId) })
      setShowForceConfirm(false)
      setAutoPopulateResult(result)
      const incomeText =
        result.income_lines_created === 1 ? 'שורת הכנסה אחת' : `${result.income_lines_created} שורות הכנסה`
      const expenseText =
        result.expense_lines_created === 1 ? 'שורת הוצאה אחת' : `${result.expense_lines_created} שורות הוצאה`
      toast.success(`נוצרו ${incomeText} ו-${expenseText} מנתוני מע"מ`)
    },
    onError: (error) => {
      if (getHttpStatus(error) === 409) {
        setShowForceConfirm(true)
        return
      }
      toast.error(getErrorMessage(error, FINANCIAL_MESSAGES.autoPopulateError))
    },
  })

  const toggleEdit = (type: 'income' | 'expense', id: number) => {
    setEditingLine((current) => (current?.type === type && current.id === id ? null : { type, id }))
  }

  const autoPopulate = (force: boolean) => {
    clearAutoPopulateResult()
    autoPopulateMutation.mutate(force)
  }

  const deleteIncome = (line: IncomeLineResponse) => {
    clearAutoPopulateResult()
    setDeletingIncomeIds((current) => new Set(current).add(line.id))
    mutations.deleteIncome.mutate(line, {
      onSettled: () =>
        setDeletingIncomeIds((current) => {
          const next = new Set(current)
          next.delete(line.id)
          return next
        }),
    })
  }

  const deleteExpense = (line: ExpenseLineResponse) => {
    clearAutoPopulateResult()
    setDeletingExpenseIds((current) => new Set(current).add(line.id))
    mutations.deleteExpense.mutate(line, {
      onSettled: () =>
        setDeletingExpenseIds((current) => {
          const next = new Set(current)
          next.delete(line.id)
          return next
        }),
    })
  }

  const addIncome = (payload: IncomeFormPayload) => {
    clearAutoPopulateResult()
    mutations.addIncome.mutate(payload)
  }

  const addExpense = (payload: ExpenseLinePayload) => {
    clearAutoPopulateResult()
    mutations.addExpense.mutate(payload)
  }

  const updateIncome = (lineId: number, payload: Partial<IncomeLinePayload>) => {
    clearAutoPopulateResult()
    mutations.updateIncome.mutate({ lineId, payload }, { onSuccess: () => setEditingLine(null) })
  }

  const updateExpense = (lineId: number, payload: Partial<ExpenseLinePayload>) => {
    clearAutoPopulateResult()
    mutations.updateExpense.mutate({ lineId, payload }, { onSuccess: () => setEditingLine(null) })
  }

  const incomeLines = financialsData?.income_lines ?? []
  const expenseLines = financialsData?.expense_lines ?? []

  return {
    isAdvisor,
    isLoading: financialsLoading,
    incomeLines,
    expenseLines,
    totals: getFinancialTotals(financialsData),
    hasLines: incomeLines.length > 0 || expenseLines.length > 0,
    editingLine,
    showForceConfirm,
    autoPopulateResult,
    deletingIncomeIds,
    deletingExpenseIds,
    toggleEdit,
    cancelEdit: () => setEditingLine(null),
    cancelForce: () => setShowForceConfirm(false),
    clearAutoPopulateResult,
    autoPopulate,
    addIncome,
    addExpense,
    updateIncome,
    updateExpense,
    deleteIncome,
    deleteExpense,
    isAutoPopulating: autoPopulateMutation.isPending,
    isAddingIncome: mutations.addIncome.isPending,
    isAddingExpense: mutations.addExpense.isPending,
    isUpdatingIncome: mutations.updateIncome.isPending,
    isUpdatingExpense: mutations.updateExpense.isPending,
  }
}
