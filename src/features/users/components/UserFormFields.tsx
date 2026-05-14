import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Input } from '../../../components/ui/inputs/Input'
import { Select } from '../../../components/ui/inputs/Select'
import type { CreateUserFormValues } from '../schemas'
import type { EditUserFormValues } from '../schemas'

// Both schemas share these four fields; password is create-only.
// We use CreateUserFormValues as the widest type (superset of Edit).
// Callers with EditUserFormValues cast once at the call site.
type UserFormRegister = UseFormRegister<CreateUserFormValues> | UseFormRegister<EditUserFormValues>

type UserFormErrors = FieldErrors<CreateUserFormValues> | FieldErrors<EditUserFormValues>

interface UserFormFieldsProps {
  register: UserFormRegister
  errors: UserFormErrors
  showPassword?: boolean
}

export const UserFormFields: React.FC<UserFormFieldsProps> = ({ register, errors, showPassword = false }) => {
  // Cast once here — both schemas share identical field names for these inputs.
  const reg = register as UseFormRegister<CreateUserFormValues>
  const err = errors as FieldErrors<CreateUserFormValues>

  return (
    <div className="space-y-4">
      <Input label="שם מלא *" {...reg('full_name')} error={err.full_name?.message} placeholder="ישראל ישראלי" />
      <Input
        label="אימייל *"
        type="email"
        {...reg('email')}
        error={err.email?.message}
        placeholder="user@example.com"
      />
      <Input label="טלפון" {...reg('phone')} error={err.phone?.message} placeholder="050-0000000" />
      <Select
        label="תפקיד *"
        options={[
          { value: 'secretary', label: 'מזכירה' },
          { value: 'advisor', label: 'יועץ' },
        ]}
        {...reg('role')}
        error={err.role?.message}
      />
      {showPassword && (
        <Input
          label="סיסמה *"
          type="password"
          {...reg('password')}
          error={err.password?.message}
          placeholder="לפחות 8 תווים"
        />
      )}
    </div>
  )
}

UserFormFields.displayName = 'UserFormFields'
