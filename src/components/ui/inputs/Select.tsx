import { forwardRef } from 'react'
import { cn } from '../../../utils/utils'
import { FormField } from './FormField'

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

const sizeClasses = {
  xs: 'h-7 px-2 py-1 text-xs',
  sm: 'h-8 px-2.5 py-1.5 text-sm',
  md: 'h-9 px-3 py-2 text-sm',
}

/**
 * A real native select. Native form events, refs, required validation, disabled
 * options, focus, and blur semantics are intentionally preserved end to end.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, size = 'md', className, fieldClassName, options, placeholder, id, ...props }, ref) => (
    <FormField id={id} label={label} error={error} className={cn('w-full', fieldClassName)}>
      {(controlProps) => {
        const describedBy = [props['aria-describedby'], controlProps['aria-describedby']].filter(Boolean).join(' ') || undefined
        return (
          <select
            {...props}
            ref={ref}
            id={controlProps.id}
            aria-describedby={describedBy}
            aria-invalid={Boolean(error) || undefined}
            className={cn(
              'w-full rounded-lg border bg-white text-gray-800 transition-colors',
              sizeClasses[size],
              'hover:border-primary-300 focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error ? 'border-negative-500' : 'border-gray-200',
              className,
            )}
            dir={props.dir ?? 'rtl'}
          >
            {placeholder ? (
              <option value="" disabled={props.required}>
                {placeholder}
              </option>
            ) : null}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        )
      }}
    </FormField>
  ),
)

Select.displayName = 'Select'
