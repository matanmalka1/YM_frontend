import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Input } from '../../../../components/ui/inputs/Input'
import type { FieldDef } from '../../annex.constants'
import { FIELD_INPUT_CLASS } from './annex.constants'
import { getInputType } from './annex.helpers'
import type { AnnexFormValues } from './annexSchema'

interface AnnexFieldInputProps {
  field: FieldDef
  register: UseFormRegister<AnnexFormValues>
  errors: FieldErrors<AnnexFormValues>
}

export const AnnexFieldInput: React.FC<AnnexFieldInputProps> = ({ field, register, errors }) => (
  <Input
    type={getInputType(field.type)}
    step={field.type === 'number' ? 'any' : undefined}
    className={FIELD_INPUT_CLASS}
    error={errors[field.key]?.message as string | undefined}
    {...register(field.key)}
  />
)
