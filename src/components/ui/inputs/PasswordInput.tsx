import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Input, type InputProps } from './Input'

type PasswordInputProps = Omit<InputProps, 'type' | 'endElement' | 'endIcon'>

export const PasswordInput = ({ ref, ...props }: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <Input
      ref={ref}
      {...props}
      type={isVisible ? 'text' : 'password'}
      endElement={
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          disabled={props.disabled}
          aria-label={isVisible ? 'הסתר סיסמה' : 'הצג סיסמה'}
          aria-pressed={isVisible}
          className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      }
    />
  )
}

PasswordInput.displayName = 'PasswordInput'
