import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Input } from '../../../../components/ui/inputs/Input'
import { cn } from '../../../../utils/utils'
import type { FieldDef } from '../../constants/annexConstants'
import { FIELD_INPUT_CLASS } from '../../constants/annexTextConstants'
import { getInputType } from '../../utils/annexHelpers'
import type { AnnexFormValues } from '../../constants/annexSchema'

interface AnnexFieldInputProps {
  field: FieldDef
  register: UseFormRegister<AnnexFormValues>
  errors: FieldErrors<AnnexFormValues>
  /** When set, renders a label above the input (add-form layout). Omitted inline in table rows. */
  label?: string
}

export const AnnexFieldInput: React.FC<AnnexFieldInputProps> = ({ field, register, errors, label }) => {
  const isTextField = field.type === 'text'

  return (
    <Input
      label={label}
      type={getInputType(field.type)}
      step={field.type === 'number' ? 'any' : undefined}
      size="xs"
      dir={isTextField ? undefined : 'ltr'}
      inputMode={field.type === 'number' ? 'decimal' : undefined}
      className={cn(FIELD_INPUT_CLASS, !isTextField && 'text-end')}
      labelClassName="text-xs text-gray-500"
      error={errors[field.key]?.message as string | undefined}
      {...register(field.key)}
    />
  )
}
