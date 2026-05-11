import { cloneElement, isValidElement, useId, type ReactElement } from 'react'
import { cn } from '../../../utils/utils'

interface FormFieldProps {
  label?: string
  error?: string
  children: ReactElement<{ id?: string }>
  className?: string
  labelClassName?: string
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, children, className, labelClassName }) => {
  const generatedId = useId()
  const controlId = children.props.id ?? generatedId
  const child = isValidElement(children) ? cloneElement(children, { id: controlId }) : children

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label htmlFor={controlId} className={cn('block text-sm font-medium text-gray-700', labelClassName)}>
          {label}
        </label>
      )}
      {child}
      {error && <p className="text-xs text-negative-600">{error}</p>}
    </div>
  )
}

FormField.displayName = 'FormField'
