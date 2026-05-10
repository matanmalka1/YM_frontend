import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { annualReportFinancialsApi, annualReportsQK } from '../../api'
import { toast } from '../../../../utils/toast'
import { useRole } from '../../../../hooks/useRole'
import { AddLineForm, AutoPopulateControls, FinancialSection, FinancialSummaryCards } from './IncomeExpensePanelParts'
import { LineRow, INCOME_LABELS, EXPENSE_LABELS } from '../../report.constants'
import { AddExpenseLineForm } from './AddExpenseLineForm'
import { useIncomeExpenseMutations } from '../../hooks/useIncomeExpenseMutations'
import { EditIncomeLineForm } from './EditIncomeLineForm'
import { EditExpenseLineForm } from './EditExpenseLineForm'
import { FINANCIAL_MESSAGES } from './financialConstants'
import { getApiErrorMessage, getApiStatus, getFinancialTotals } from './financialHelpers'

interface IncomeExpensePanelProps {
  reportId: number
}
type EditingLine = { type: 'income' | 'expense'; id: number } | null

export const IncomeExpensePanel: React.FC<IncomeExpensePanelProps> = ({ reportId }) => {
  const [editingLine, setEditingLine] = useState<EditingLine>(null)
  const [showForceConfirm, setShowForceConfirm] = useState(false)
  const { isAdvisor } = useRole()
  const queryClient = useQueryClient()
  const toggleEdit = (type: 'income' | 'expense', id: number) => {
    setEditingLine((current) => (current?.type === type && current.id === id ? null : { type, id }))
  }

  const autoPopulateMutation = useMutation({
    mutationFn: (force: boolean) => annualReportFinancialsApi.autoPopulate(reportId, force),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: annualReportsQK.financials(reportId) })
      setShowForceConfirm(false)
      toast.success(
        `נוצרו ${result.income_lines_created} שורות הכנסה ו-${result.expense_lines_created} שורות הוצאה מנתוני מע"מ`,
      )
    },
    onError: (err: unknown) => {
      if (getApiStatus(err) === 409) {
        setShowForceConfirm(true)
      } else {
        toast.error(getApiErrorMessage(err, FINANCIAL_MESSAGES.autoPopulateError))
      }
    },
  })

  const { data, isLoading } = useQuery({
    queryKey: annualReportsQK.financials(reportId),
    queryFn: () => annualReportFinancialsApi.getFinancials(reportId),
    enabled: !!reportId,
  })

  const { addIncome, deleteIncome, addExpense, updateIncome, updateExpense, deleteExpense } =
    useIncomeExpenseMutations(reportId)

  if (isLoading) {
    return <p className="py-8 text-center text-sm text-gray-400">{FINANCIAL_MESSAGES.loadingFinancials}</p>
  }

  const incomeLines = data?.income_lines ?? []
  const expenseLines = data?.expense_lines ?? []
  const totals = getFinancialTotals(data)
  const hasLines = incomeLines.length > 0 || expenseLines.length > 0

  return (
    <div className="space-y-5">
      {isAdvisor && (
        <AutoPopulateControls
          showForceConfirm={showForceConfirm}
          isPending={autoPopulateMutation.isPending}
          onPopulate={(force) => autoPopulateMutation.mutate(force)}
          onCancelForce={() => setShowForceConfirm(false)}
        />
      )}
      {hasLines && (
        <FinancialSummaryCards
          totalIncome={totals.income}
          totalExpenses={totals.expenses}
          taxableIncome={totals.taxableIncome}
        />
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <FinancialSection
          icon={<ArrowUpCircle className="h-4 w-4 text-positive-600" />}
          title="הכנסות"
          total={totals.income}
          titleClassName="text-positive-800"
          headerClassName="bg-positive-50"
          totalClassName="text-positive-600"
          emptyMessage={FINANCIAL_MESSAGES.noIncome}
          isEmpty={incomeLines.length === 0}
          footer={
            <AddLineForm
              typeOptions={INCOME_LABELS}
              onAdd={(key, amt, desc) => addIncome.mutate({ type_key: key, amount: Number(amt), description: desc })}
              isAdding={addIncome.isPending}
              label="הוסף הכנסה"
            />
          }
        >
          {incomeLines.map((l) => (
            <div key={l.id}>
              <LineRow
                label={INCOME_LABELS[l.source_type] ?? l.source_type}
                amount={l.amount}
                description={l.description}
                onEdit={() => toggleEdit('income', l.id)}
                onDelete={() => deleteIncome.mutate(l.id)}
                isDeleting={deleteIncome.isPending}
              />
              {editingLine?.type === 'income' && editingLine.id === l.id && (
                <EditIncomeLineForm
                  line={l}
                  typeOptions={INCOME_LABELS}
                  isSaving={updateIncome.isPending}
                  onCancel={() => setEditingLine(null)}
                  onSave={(p) =>
                    updateIncome.mutate({ lineId: l.id, payload: p }, { onSuccess: () => setEditingLine(null) })
                  }
                />
              )}
            </div>
          ))}
        </FinancialSection>

        <FinancialSection
          icon={<ArrowDownCircle className="h-4 w-4 text-negative-500" />}
          title="הוצאות"
          total={totals.expenses}
          titleClassName="text-negative-800"
          headerClassName="bg-negative-50"
          totalClassName="text-negative-600"
          emptyMessage={FINANCIAL_MESSAGES.noExpenses}
          isEmpty={expenseLines.length === 0}
          footer={<AddExpenseLineForm onAdd={(p) => addExpense.mutate(p)} isAdding={addExpense.isPending} />}
        >
          {expenseLines.map((l) => (
            <div key={l.id}>
              <LineRow
                label={EXPENSE_LABELS[l.category] ?? l.category}
                amount={l.amount}
                description={l.description}
                recognitionRate={l.recognition_rate}
                supportingDocumentRef={l.external_document_reference}
                supportingDocumentId={l.supporting_document_id}
                supportingDocumentFilename={l.supporting_document_filename}
                onEdit={() => toggleEdit('expense', l.id)}
                onDelete={() => deleteExpense.mutate(l.id)}
                isDeleting={deleteExpense.isPending}
              />
              {editingLine?.type === 'expense' && editingLine.id === l.id && (
                <EditExpenseLineForm
                  line={l}
                  isSaving={updateExpense.isPending}
                  onCancel={() => setEditingLine(null)}
                  onSave={(p) =>
                    updateExpense.mutate({ lineId: l.id, payload: p }, { onSuccess: () => setEditingLine(null) })
                  }
                />
              )}
            </div>
          ))}
        </FinancialSection>
      </div>
    </div>
  )
}

IncomeExpensePanel.displayName = 'IncomeExpensePanel'
