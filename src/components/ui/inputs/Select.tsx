import { cn } from '../../../utils/utils'
import { FormField } from './FormField'
import { SelectDropdown } from './SelectDropdown'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'children'> {
  label?: string
  error?: string
  size?: 'xs' | 'sm' | 'md'
  options: SelectOption[]
  placeholder?: string
  fieldClassName?: string
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  size = 'md',
  className,
  fieldClassName,
  options,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled,
  name,
  id,
}) => (
  <FormField label={label} error={error} className={cn('w-full', fieldClassName)}>
    <SelectDropdown
      id={id}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      options={options}
      disabled={disabled}
      size={size}
      name={name}
      error={Boolean(error)}
      placeholder={placeholder}
      className={className}
    />
  </FormField>
)
