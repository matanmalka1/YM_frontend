import React from 'react'
import { cn } from '../../../utils/utils'
import { FormField } from './FormField'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  size?: 'sm' | 'md'
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
  nonResizable = false,
  className,
  ref,
  ...props
}: TextareaProps) => (
  <FormField label={label} error={error} className={cn('w-full text-sm', className)}>
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-gray-300 shadow-sm transition-all',
        textareaSizeClasses[size],
        nonResizable && 'resize-none',
        'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500',
        error && 'border-negative-200 focus:border-negative-400 focus:ring-negative-200',
      )}
      {...props}
    />
  </FormField>
)

Textarea.displayName = 'Textarea'
