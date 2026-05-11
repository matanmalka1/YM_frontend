import React from 'react'
import { cn } from '../../../utils/utils'
import { FormField } from './FormField'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  labelClassName?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  endElement?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, labelClassName, className, startIcon, endIcon, endElement, ...props }, ref) => {
    const hasStart = Boolean(startIcon)
    const hasEnd = Boolean(endIcon || endElement)

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
              'h-9 w-full rounded-lg border px-3 py-2 shadow-sm transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500 sm:text-sm',
              error ? 'border-negative-500' : 'border-gray-300',
              props.disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white',
              hasStart ? 'ps-11' : 'ps-3',
              hasEnd ? 'pe-11' : 'pe-3',
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
