import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Input } from '../../../../components/ui/inputs/Input'
import type { FieldDef } from '../../constants/annexConstants'
import { FIELD_INPUT_CLASS } from '../../constants/annexTextConstants'
import { getInputType } from '../../utils/annexHelpers'
import type { AnnexFormValues } from '../../constants/annexSchema'

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
