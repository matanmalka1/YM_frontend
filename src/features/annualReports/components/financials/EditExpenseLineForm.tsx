import type { ExpenseLineResponse, ExpenseCategoryType } from '../../api'
import { EXPENSE_LABELS } from '../../report.constants'
import {
  ExpenseSupplementaryFields,
  FinancialAmountDescriptionFields,
  FinancialEditFormShell,
  FinancialSelectField,
} from './FinancialLineFormParts'
import { useExpenseLineForm } from './useFinancialLineForm'

interface EditExpenseLineFormProps {
  line: ExpenseLineResponse
  isSaving: boolean
  onSave: (payload: {
    category: ExpenseCategoryType
    amount: string
    description?: string
    recognition_rate?: string
    external_document_reference?: string
  }) => void
  onCancel: () => void
}

export const EditExpenseLineForm: React.FC<EditExpenseLineFormProps> = ({ line, isSaving, onSave, onCancel }) => {
  const form = useExpenseLineForm(line, onSave)

  return (
    <FinancialEditFormShell error={form.error} isSubmitting={isSaving} onSubmit={form.submit} onCancel={onCancel}>
      <FinancialSelectField value={form.category} onChange={form.setCategory} options={EXPENSE_LABELS} />
      <FinancialAmountDescriptionFields
        amount={form.amount}
        onAmountChange={form.setAmount}
        description={form.description}
        onDescriptionChange={form.setDescription}
      />
      <ExpenseSupplementaryFields
        recognitionRate={form.recognitionRate}
        onRecognitionRateChange={form.setRecognitionRate}
        documentReference={form.documentReference}
        onDocumentReferenceChange={form.setDocumentReference}
      />
    </FinancialEditFormShell>
  )
}

EditExpenseLineForm.displayName = 'EditExpenseLineForm'
