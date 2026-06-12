import type { FormEvent, ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../../../components/ui/primitives/Button'
import { Input } from '../../../../components/ui/inputs/Input'
import { Select } from '../../../../components/ui/inputs/Select'
import {
  FIELD_PLACEHOLDERS,
  INLINE_ADD_FORM_CLASS,
  INLINE_EDIT_FORM_CLASS,
  MONEY_INPUT_PROPS,
  PERCENTAGE_INPUT_PROPS,
} from './financialConstants'

interface AddLineTriggerButtonProps {
  label: string
  onClick: () => void
}

const AddLineTriggerButton: React.FC<AddLineTriggerButtonProps> = ({ label, onClick }) => (
  <Button type="button" variant="ghost" size="sm" onClick={onClick} className="mt-1 gap-1 text-xs">
    <Plus className="h-3.5 w-3.5" />
    {label}
  </Button>
)

interface FinancialSelectFieldProps {
  value: string
  onChange: (value: string) => void
  options: Record<string, string>
  placeholder?: string
}

export const FinancialSelectField: React.FC<FinancialSelectFieldProps> = ({
  value,
  onChange,
  options,
  placeholder,
}) => (
  <Select
    value={value}
    onChange={(event) => onChange(event.target.value)}
    options={[
      ...(placeholder ? [{ value: '', label: placeholder, disabled: true }] : []),
      ...Object.entries(options).map(([key, label]) => ({ value: key, label })),
    ]}
  />
)

interface FinancialInputFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: 'number' | 'text'
  min?: string
  max?: string
  step?: string
}

const FinancialInputField: React.FC<FinancialInputFieldProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  min,
  max,
  step,
}) => (
  <Input
    value={value}
    onChange={(event) => onChange(event.target.value)}
    type={type}
    min={min}
    max={max}
    step={step}
    placeholder={placeholder}
    className="py-1 text-sm"
  />
)

interface FinancialAmountDescriptionFieldsProps {
  amount: string
  onAmountChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
}

export const FinancialAmountDescriptionFields: React.FC<FinancialAmountDescriptionFieldsProps> = ({
  amount,
  onAmountChange,
  description,
  onDescriptionChange,
}) => (
  <>
    <FinancialInputField
      value={amount}
      onChange={onAmountChange}
      {...MONEY_INPUT_PROPS}
      placeholder={FIELD_PLACEHOLDERS.amount}
    />
    <FinancialInputField
      value={description}
      onChange={onDescriptionChange}
      placeholder={FIELD_PLACEHOLDERS.description}
    />
  </>
)

interface ExpenseSupplementaryFieldsProps {
  recognitionRate: string
  onRecognitionRateChange: (value: string) => void
  documentReference: string
  onDocumentReferenceChange: (value: string) => void
}

export const ExpenseSupplementaryFields: React.FC<ExpenseSupplementaryFieldsProps> = ({
  recognitionRate,
  onRecognitionRateChange,
  documentReference,
  onDocumentReferenceChange,
}) => (
  <>
    <FinancialInputField
      value={recognitionRate}
      onChange={onRecognitionRateChange}
      {...PERCENTAGE_INPUT_PROPS}
      placeholder={FIELD_PLACEHOLDERS.recognitionRate}
    />
    <FinancialInputField
      value={documentReference}
      onChange={onDocumentReferenceChange}
      placeholder={FIELD_PLACEHOLDERS.documentReference}
    />
  </>
)

interface FinancialFormActionsProps {
  isSubmitting: boolean
  submitLabel: string
  onCancel: () => void
}

const FinancialFormActions: React.FC<FinancialFormActionsProps> = ({ isSubmitting, submitLabel, onCancel }) => (
  <div className="flex gap-2">
    <Button type="submit" size="sm" isLoading={isSubmitting} className="flex-1">
      {submitLabel}
    </Button>
    <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
      ביטול
    </Button>
  </div>
)

interface FinancialFormErrorProps {
  error: string | null
}

const FinancialFormError: React.FC<FinancialFormErrorProps> = ({ error }) =>
  error ? <p className="text-xs text-negative-500">{error}</p> : null

interface FinancialAddFormShellProps {
  open: boolean
  label: string
  error: string | null
  isSubmitting: boolean
  onOpen: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  children: ReactNode
}

export const FinancialAddFormShell: React.FC<FinancialAddFormShellProps> = ({
  open,
  label,
  error,
  isSubmitting,
  onOpen,
  onSubmit,
  onCancel,
  children,
}) => {
  if (!open) {
    return <AddLineTriggerButton label={label} onClick={onOpen} />
  }

  return (
    <form onSubmit={onSubmit}>
      <div className={INLINE_ADD_FORM_CLASS}>
        {children}
        <FinancialFormError error={error} />
        <FinancialFormActions isSubmitting={isSubmitting} submitLabel="הוסף" onCancel={onCancel} />
      </div>
    </form>
  )
}

interface FinancialEditFormShellProps {
  error: string | null
  isSubmitting: boolean
  submitLabel?: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  children: ReactNode
}

export const FinancialEditFormShell: React.FC<FinancialEditFormShellProps> = ({
  error,
  isSubmitting,
  submitLabel = 'שמור',
  onSubmit,
  onCancel,
  children,
}) => (
  <form onSubmit={onSubmit}>
    <div className={INLINE_EDIT_FORM_CLASS}>
      {children}
      <FinancialFormError error={error} />
      <FinancialFormActions isSubmitting={isSubmitting} submitLabel={submitLabel} onCancel={onCancel} />
    </div>
  </form>
)
