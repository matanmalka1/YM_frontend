import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Input } from '../../../../components/ui/inputs/Input'
import { PasswordInput } from '../../../../components/ui/inputs/PasswordInput'
import { Select } from '../../../../components/ui/inputs/Select'
import type { CreateUserFormValues } from '../../schemas'
import type { EditUserFormValues } from '../../schemas'
import { USERS_MESSAGES } from '../../messages'

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
      <Input
        label={USERS_MESSAGES.form.fullName}
        {...reg('full_name')}
        error={err.full_name?.message}
        placeholder={USERS_MESSAGES.form.fullNamePlaceholder}
      />
      <Input
        label={USERS_MESSAGES.form.email}
        type="email"
        {...reg('email')}
        error={err.email?.message}
        placeholder="user@example.com"
      />
      <Input label={USERS_MESSAGES.form.phone} {...reg('phone')} error={err.phone?.message} placeholder="050-0000000" />
      <Select
        label={USERS_MESSAGES.form.role}
        options={[
          { value: 'secretary', label: USERS_MESSAGES.form.secretary },
          { value: 'advisor', label: USERS_MESSAGES.form.advisor },
        ]}
        {...reg('role')}
        error={err.role?.message}
      />
      {showPassword && (
        <PasswordInput
          label={USERS_MESSAGES.form.password}
          {...reg('password')}
          error={err.password?.message}
          placeholder={USERS_MESSAGES.form.passwordPlaceholder}
        />
      )}
    </div>
  )
}

UserFormFields.displayName = 'UserFormFields'
