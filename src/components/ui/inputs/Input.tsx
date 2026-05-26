import React from 'react'
import { cn } from '../../../utils/utils'
import { FormField } from './FormField'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  size?: 'xs' | 'sm' | 'md'
  labelClassName?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  endElement?: React.ReactNode
}

const inputSizeClasses = {
  xs: 'h-7 px-2 py-1 text-xs',
  sm: 'h-8 px-2.5 py-1.5 text-sm',
  md: 'h-9 px-3 py-2 sm:text-sm',
}

const inputIconPadding = {
  xs: { start: 'ps-8', end: 'pe-8', defaultStart: 'ps-2', defaultEnd: 'pe-2' },
  sm: { start: 'ps-9', end: 'pe-9', defaultStart: 'ps-2.5', defaultEnd: 'pe-2.5' },
  md: { start: 'ps-11', end: 'pe-11', defaultStart: 'ps-3', defaultEnd: 'pe-3' },
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, size = 'md', labelClassName, className, startIcon, endIcon, endElement, ...props }, ref) => {
    const hasStart = Boolean(startIcon)
    const hasEnd = Boolean(endIcon || endElement)
    const padding = inputIconPadding[size]

    return (
      <FormField label={label} error={error} labelClassName={labelClassName} className="w-full">
        <div className="relative">
          {startIcon && (
            <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-gray-400">
              {startIcon}
            </span>
          )}

          <input
            ref={ref}
            className={cn(
              'w-full rounded-lg border shadow-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500',
              inputSizeClasses[size],
              error ? 'border-negative-500' : 'border-gray-300',
              props.disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white',
              hasStart ? padding.start : padding.defaultStart,
              hasEnd ? padding.end : padding.defaultEnd,
              className,
            )}
            {...props}
          />

          {endElement ? (
            <span className="absolute end-2 top-1/2 -translate-y-1/2">{endElement}</span>
          ) : (
            endIcon && (
              <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-gray-400">
                {endIcon}
              </span>
            )
          )}
        </div>
      </FormField>
    )
  },
)

Input.displayName = 'Input'
