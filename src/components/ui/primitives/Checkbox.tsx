import { forwardRef, useImperativeHandle, useRef } from 'react'

import { cn } from '../../../utils/utils'

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: React.ReactNode
  description?: React.ReactNode
  size?: 'sm' | 'md'
  containerClassName?: string
  inputClassName?: string
  indeterminate?: boolean
}

const checkboxSizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
}

const labelSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { label, description, size = 'md', className, containerClassName, inputClassName, indeterminate = false, ...props },
    forwardedRef,
  ) => {
    const innerRef = useRef<HTMLInputElement>(null)
    useImperativeHandle(forwardedRef, () => innerRef.current as HTMLInputElement)
    const setIndeterminate = (element: HTMLInputElement | null) => {
      innerRef.current = element
      if (element) {
        element.indeterminate = indeterminate
      }
    }
    const hasLabel = Boolean(label) || Boolean(description)
    const checkbox = (
      <input
        ref={setIndeterminate}
        type="checkbox"
        className={cn(
          'rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
          checkboxSizeClasses[size],
          'disabled:cursor-not-allowed disabled:opacity-50',
          inputClassName,
          // Bare className routes to the input only when there's no label wrapper.
          !hasLabel && className,
        )}
        {...props}
      />
    )

    if (!hasLabel) {
      return checkbox
    }

    return (
      <label className={cn('flex cursor-pointer select-none items-start gap-2', containerClassName, className)}>
        {checkbox}
        <span className="min-w-0">
          {label ? (
            <span className={cn('block font-medium text-gray-700', labelSizeClasses[size])}>{label}</span>
          ) : null}
          {description ? <span className="block text-xs text-gray-500">{description}</span> : null}
        </span>
      </label>
    )
  },
)

Checkbox.displayName = 'Checkbox'
