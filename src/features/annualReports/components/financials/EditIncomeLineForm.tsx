import type { IncomeLineResponse } from '../../api'
import { FinancialAmountDescriptionFields, FinancialEditFormShell, FinancialSelectField } from './FinancialLineFormParts'
import type { IncomeFormPayload } from '../../utils/financialHelpers'
import { useIncomeLineForm } from '../../hooks/useFinancialLineForm'

interface EditIncomeLineFormProps {
  line: IncomeLineResponse
  typeOptions: Record<string, string>
  isSaving: boolean
  onSave: (payload: IncomeFormPayload) => void
  onCancel: () => void
}

export const EditIncomeLineForm: React.FC<EditIncomeLineFormProps> = ({ line, typeOptions, isSaving, onSave, onCancel }) => {
  const form = useIncomeLineForm(line, onSave)

  return (
    <FinancialEditFormShell error={form.error} isSubmitting={isSaving} onSubmit={form.submit} onCancel={onCancel}>
      <FinancialSelectField value={form.typeKey} onChange={form.setTypeKey} options={typeOptions} />
      <FinancialAmountDescriptionFields
        amount={form.amount}
        onAmountChange={form.setAmount}
        description={form.description}
        onDescriptionChange={form.setDescription}
      />
    </FinancialEditFormShell>
  )
}

EditIncomeLineForm.displayName = 'EditIncomeLineForm'
