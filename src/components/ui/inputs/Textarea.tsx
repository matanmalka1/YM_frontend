import React from 'react'
import { cn } from '../../../utils/utils'
import { FormField } from './FormField'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, className, ...props }, ref) => (
  <FormField label={label} error={error} className={cn('w-full text-sm', className)}>
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-all',
        'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500',
        error && 'border-negative-200 focus:border-negative-400 focus:ring-negative-200',
      )}
      {...props}
    />
  </FormField>
))

Textarea.displayName = 'Textarea'
