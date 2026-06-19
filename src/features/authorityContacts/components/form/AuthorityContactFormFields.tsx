import type { UseFormReturn } from 'react-hook-form'
import { Input } from '../../../../components/ui/inputs/Input'
import { Select } from '../../../../components/ui/inputs/Select'
import { Textarea } from '../../../../components/ui/inputs/Textarea'
import { AUTHORITY_CONTACT_TYPE_OPTIONS } from '../../api'
import {
  AUTHORITY_CONTACT_FIELD_LABELS,
  AUTHORITY_CONTACT_PLACEHOLDERS,
  AUTHORITY_CONTACT_STATIC_PLACEHOLDERS,
} from '../../constants'
import type { AuthorityContactFormValues } from '../../schemas'

interface AuthorityContactFormFieldsProps {
  form: UseFormReturn<AuthorityContactFormValues>
}

export const AuthorityContactFormFields: React.FC<AuthorityContactFormFieldsProps> = ({ form }) => {
  const {
    register,
    watch,
    formState: { errors },
  } = form
  const contactType = watch('contact_type')
  const placeholders = AUTHORITY_CONTACT_PLACEHOLDERS[contactType]

  return (
    <>
      <Select
        label={AUTHORITY_CONTACT_FIELD_LABELS.contactType}
        error={errors.contact_type?.message}
        {...register('contact_type')}
      >
        {AUTHORITY_CONTACT_TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Input
        label={AUTHORITY_CONTACT_FIELD_LABELS.name}
        placeholder={placeholders.name}
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label={AUTHORITY_CONTACT_FIELD_LABELS.office}
        placeholder={placeholders.office}
        error={errors.office?.message}
        {...register('office')}
      />
      <Input
        label={AUTHORITY_CONTACT_FIELD_LABELS.phone}
        type="tel"
        dir="rtl"
        placeholder={AUTHORITY_CONTACT_STATIC_PLACEHOLDERS.phone}
        error={errors.phone?.message}
        {...register('phone')}
      />
      <Input
        label={AUTHORITY_CONTACT_FIELD_LABELS.email}
        type="email"
        placeholder={AUTHORITY_CONTACT_STATIC_PLACEHOLDERS.email}
        error={errors.email?.message}
        {...register('email')}
      />
      <Textarea
        label={AUTHORITY_CONTACT_FIELD_LABELS.notes}
        rows={3}
        placeholder={AUTHORITY_CONTACT_STATIC_PLACEHOLDERS.notes}
        error={errors.notes?.message}
        {...register('notes')}
      />
    </>
  )
}
