import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { AnnualReportAddIncomeLineForm } from './AnnualReportAddIncomeLineForm'
import { AnnualReportFinancialSection } from './AnnualReportFinancialSection'
import { AnnualReportVatAutoPopulateControls } from './AnnualReportVatAutoPopulateControls'
import { AnnualReportVatAutoPopulateResultPanel } from './AnnualReportVatAutoPopulateResultPanel'
import { LineRow } from './FinancialLineRow'
import { INCOME_LABELS, EXPENSE_LABELS } from '../../constants/reportConstants'
import { AddExpenseLineForm } from './AddExpenseLineForm'
import { useIncomeExpenseTab } from '../../hooks/useIncomeExpenseTab'
import { EditIncomeLineForm } from './EditIncomeLineForm'
import { EditExpenseLineForm } from './EditExpenseLineForm'
import { FINANCIAL_MESSAGES } from '../../constants/financialConstants'
import { normalizeExpenseDescription } from '../../utils/financialHelpers'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

interface IncomeExpenseTabProps {
  reportId: number
  clientRecordId: number
}
export const IncomeExpenseTab: React.FC<IncomeExpenseTabProps> = ({ reportId, clientRecordId }) => {
  const panel = useIncomeExpenseTab(reportId)

  if (panel.isLoading) {
    return <p className="py-8 text-center text-sm text-gray-400">{FINANCIAL_MESSAGES.loadingFinancials}</p>
  }

  return (
    <div className="space-y-5">
      {panel.isAdvisor && (
        <AnnualReportVatAutoPopulateControls
          showForceConfirm={panel.showForceConfirm}
          isPending={panel.isAutoPopulating}
          onPopulate={panel.autoPopulate}
          onCancelForce={panel.cancelForce}
        />
      )}
      {panel.autoPopulateResult && (
        <AnnualReportVatAutoPopulateResultPanel result={panel.autoPopulateResult} onDismiss={panel.clearAutoPopulateResult} />
      )}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AnnualReportFinancialSection
          icon={<ArrowUpCircle className="h-4 w-4 text-positive-600" />}
          title={ANNUAL_REPORTS_MESSAGES.incomeExpense.incomeTitle}
          total={panel.totals.income}
          titleClassName="text-positive-800"
          headerClassName="bg-positive-50"
          totalClassName="text-positive-600"
          emptyMessage={FINANCIAL_MESSAGES.noIncome}
          isEmpty={panel.incomeLines.length === 0}
          footer={
            <AnnualReportAddIncomeLineForm
              typeOptions={INCOME_LABELS}
              onAdd={panel.addIncome}
              isAdding={panel.isAddingIncome}
              label={ANNUAL_REPORTS_MESSAGES.incomeExpense.addIncome}
            />
          }
        >
          {panel.incomeLines.map((l) => (
            <div key={l.id}>
              <LineRow
                label={INCOME_LABELS[l.source_type] ?? l.source_type}
                amount={l.amount}
                description={l.description}
                onEdit={() => panel.toggleEdit('income', l.id)}
                onDelete={() => panel.deleteIncome(l)}
                isDeleting={panel.deletingIncomeIds.has(l.id)}
              />
              {panel.editingLine?.type === 'income' && panel.editingLine.id === l.id && (
                <EditIncomeLineForm
                  line={l}
                  typeOptions={INCOME_LABELS}
                  isSaving={panel.isUpdatingIncome}
                  onCancel={panel.cancelEdit}
                  onSave={(payload) => panel.updateIncome(l.id, payload)}
                />
              )}
            </div>
          ))}
        </AnnualReportFinancialSection>

        <AnnualReportFinancialSection
          icon={<ArrowDownCircle className="h-4 w-4 text-negative-500" />}
          title={ANNUAL_REPORTS_MESSAGES.incomeExpense.expensesTitle}
          total={panel.totals.expenses}
          titleClassName="text-negative-800"
          headerClassName="bg-negative-50"
          totalClassName="text-negative-600"
          emptyMessage={FINANCIAL_MESSAGES.noExpenses}
          isEmpty={panel.expenseLines.length === 0}
          footer={<AddExpenseLineForm onAdd={panel.addExpense} isAdding={panel.isAddingExpense} />}
        >
          {panel.expenseLines.map((l) => (
            <div key={l.id}>
              <LineRow
                label={EXPENSE_LABELS[l.category] ?? l.category}
                amount={l.amount}
                description={normalizeExpenseDescription(l.description)}
                recognitionRate={l.recognition_rate}
                supportingDocumentRef={l.external_document_reference}
                supportingDocumentId={l.supporting_document_id}
                supportingDocumentClientRecordId={l.supporting_document_id != null ? clientRecordId : null}
                supportingDocumentFilename={l.supporting_document_filename}
                onEdit={() => panel.toggleEdit('expense', l.id)}
                onDelete={() => panel.deleteExpense(l)}
                isDeleting={panel.deletingExpenseIds.has(l.id)}
              />
              {panel.editingLine?.type === 'expense' && panel.editingLine.id === l.id && (
                <EditExpenseLineForm
                  line={l}
                  isSaving={panel.isUpdatingExpense}
                  onCancel={panel.cancelEdit}
                  onSave={(payload) => panel.updateExpense(l.id, payload)}
                />
              )}
            </div>
          ))}
        </AnnualReportFinancialSection>
      </div>
    </div>
  )
}

IncomeExpenseTab.displayName = 'IncomeExpenseTab'
