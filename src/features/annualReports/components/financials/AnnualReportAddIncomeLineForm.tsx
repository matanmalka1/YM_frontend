import { useState } from 'react'
import { FIELD_PLACEHOLDERS } from '../../constants/financialConstants'
import { useIncomeLineForm } from '../../hooks/useFinancialLineForm'
import type { IncomeFormPayload } from '../../utils/financialHelpers'
import type { IncomeSourceType } from '../../api'
import { FinancialAddFormShell, FinancialAmountDescriptionFields, FinancialSelectField } from './FinancialLineFormParts'

interface AnnualReportAddIncomeLineFormProps {
  typeOptions: Record<IncomeSourceType, string>
  onAdd: (payload: IncomeFormPayload) => void
  isAdding: boolean
  label: string
}

export const AnnualReportAddIncomeLineForm: React.FC<AnnualReportAddIncomeLineFormProps> = ({
  typeOptions,
  onAdd,
  isAdding,
  label,
}) => {
  const [open, setOpen] = useState(false)
  const form = useIncomeLineForm(undefined, (payload) => {
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
      label={label}
      error={form.error}
      isSubmitting={isAdding}
      onOpen={() => setOpen(true)}
      onSubmit={form.submit}
      onCancel={close}
    >
      <FinancialSelectField
        value={form.typeKey}
        onChange={form.setTypeKey}
        options={typeOptions}
        placeholder={FIELD_PLACEHOLDERS.incomeType}
      />
      <FinancialAmountDescriptionFields
        amount={form.amount}
        onAmountChange={form.setAmount}
        description={form.description}
        onDescriptionChange={form.setDescription}
      />
    </FinancialAddFormShell>
  )
}
