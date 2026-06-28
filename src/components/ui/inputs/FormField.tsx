import { useId, type ReactNode } from 'react'
import { cn } from '../../../utils/utils'

export interface FormFieldControlProps {
  id: string
  'aria-invalid'?: true
  'aria-describedby'?: string
}

interface FormFieldProps {
  id?: string
  label?: string
  error?: string
  children: (controlProps: FormFieldControlProps) => ReactNode
  className?: string
  labelClassName?: string
}

export const FormField: React.FC<FormFieldProps> = ({ id, label, error, children, className, labelClassName }) => {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const errorId = `${controlId}-error`
  const controlProps: FormFieldControlProps = {
    id: controlId,
    ...(error ? { 'aria-invalid': true, 'aria-describedby': errorId } : {}),
  }

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label htmlFor={controlId} className={cn('block text-sm font-medium text-gray-700', labelClassName)}>
          {label}
        </label>
      )}
      {children(controlProps)}
      {error && (
        <p id={errorId} className="text-xs text-negative-600">
          {error}
        </p>
      )}
    </div>
  )
}

FormField.displayName = 'FormField'
