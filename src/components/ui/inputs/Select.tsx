import { ChevronDown } from 'lucide-react'
import { cn } from '../../../utils/utils'
import { FormField } from './FormField'
import { SelectDropdown } from './SelectDropdown'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  size?: 'xs' | 'sm' | 'md'
  options?: SelectOption[]
}

const selectSizeClasses = {
  xs: 'h-7 px-2 py-1 pr-8 text-xs',
  sm: 'h-8 px-2.5 py-1.5 pr-8 text-sm',
  md: 'px-3 py-2.5 pr-9 text-sm',
}

const chevronSizeClasses = {
  xs: 'right-2 h-3.5 w-3.5',
  sm: 'right-2 h-4 w-4',
  md: 'right-2.5 h-4 w-4',
}

const ChevronIcon = ({ size }: { size: NonNullable<SelectProps['size']> }) => (
  <ChevronDown
    className={cn('pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-400', chevronSizeClasses[size])}
  />
)

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  size = 'md',
  className,
  options,
  children,
  value,
  onChange,
  onBlur,
  disabled,
  name,
  ...props
}) => (
  <FormField label={label} error={error} className="w-full">
    {Array.isArray(options) ? (
      <SelectDropdown
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        options={options}
        disabled={disabled}
        size={size}
        name={name}
        className={cn(error ? 'border-negative-500' : undefined, className)}
      />
    ) : (
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          name={name}
          className={cn(
            'appearance-none w-full bg-white border rounded-lg text-gray-800 cursor-pointer transition-colors',
            selectSizeClasses[size],
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-primary-300',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-negative-500' : 'border-gray-200',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronIcon size={size} />
      </div>
    )}
  </FormField>
)
