import { toast as sonnerToast } from 'sonner'
import type { CSSProperties } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

const RTL_STYLE: CSSProperties = { direction: 'rtl' }

const TOAST_DURATION_BY_TYPE: Record<ToastType, number> = {
  success: 4000,
  error: 6000,
  info: 4000,
  warning: 5000,
}

interface ToastOptions {
  duration?: number
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const notify = (type: ToastType, message: string, options?: ToastOptions): void => {
  sonnerToast[type](message, {
    style: RTL_STYLE,
    description: options?.description,
    duration: options?.duration ?? TOAST_DURATION_BY_TYPE[type],
    action: options?.action,
  })
}

export const toast: Record<ToastType, (message: string, options?: ToastOptions) => void> = {
  success: (message, options) => notify('success', message, options),
  error: (message, options) => notify('error', message, options),
  info: (message, options) => notify('info', message, options),
  warning: (message, options) => notify('warning', message, options),
}
