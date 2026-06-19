import { useState } from 'react'
import { EXPENSE_LABELS } from '../../constants/reportConstants'
import { FIELD_PLACEHOLDERS } from '../../constants/financialConstants'
import {
  ExpenseSupplementaryFields,
  FinancialAddFormShell,
  FinancialAmountDescriptionFields,
  FinancialSelectField,
} from './FinancialLineFormParts'
import type { AddExpensePayload } from '../../utils/financialHelpers'
import { useExpenseLineForm } from '../../hooks/useFinancialLineForm'

interface AddExpenseLineFormProps {
  onAdd: (payload: AddExpensePayload) => void
  isAdding: boolean
}

export const AddExpenseLineForm: React.FC<AddExpenseLineFormProps> = ({ onAdd, isAdding }) => {
  const [open, setOpen] = useState(false)
  const form = useExpenseLineForm(undefined, (payload) => {
    onAdd(payload)
    form.reset()
    setOpen(false)
  })

  const close = () => {
    form.reset()
    setOpen(false)
  }

  return (
    <FinancialAddFormShell
      open={open}
      label="הוסף הוצאה"
      error={form.error}
      isSubmitting={isAdding}
      onOpen={() => setOpen(true)}
      onSubmit={form.submit}
      onCancel={close}
    >
      <FinancialSelectField
        value={form.category}
        onChange={form.setCategory}
        options={EXPENSE_LABELS}
        placeholder={FIELD_PLACEHOLDERS.expenseCategory}
      />
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
    </FinancialAddFormShell>
  )
}
