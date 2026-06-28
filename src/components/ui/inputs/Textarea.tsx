import React from 'react'
import { cn } from '../../../utils/utils'
import { FormField } from './FormField'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  size?: 'sm' | 'md'
  fieldClassName?: string
  nonResizable?: boolean
  ref?: React.Ref<HTMLTextAreaElement>
}

const textareaSizeClasses = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
}

export const Textarea = ({
  label,
  error,
  size = 'md',
  fieldClassName,
  nonResizable = false,
  className,
  ref,
  id,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: TextareaProps) => (
  <FormField id={id} label={label} error={error} className={cn('w-full text-sm', fieldClassName)}>
    {(controlProps) => {
      const describedBy = [ariaDescribedBy, controlProps['aria-describedby']].filter(Boolean).join(' ') || undefined

      return (
        <textarea
          ref={ref}
          id={controlProps.id}
          aria-describedby={describedBy}
          aria-invalid={controlProps['aria-invalid'] ?? ariaInvalid}
          className={cn(
            'w-full rounded-lg border border-gray-300 shadow-sm transition-all',
            textareaSizeClasses[size],
            nonResizable && 'resize-none',
            'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500',
            error && 'border-negative-200 focus:border-negative-400 focus:ring-negative-200',
            className,
          )}
          {...props}
        />
      )
    }}
  </FormField>
)

Textarea.displayName = 'Textarea'
