import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { StateCard } from '../ui/feedback/StateCard'

interface AppLogger {
  error: (event: string, context?: Record<string, unknown>) => void
}

interface AppErrorBoundaryProps {
  children: React.ReactNode
  homePath?: string
}

interface AppErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

declare global {
  interface Window {
    __APP_LOGGER__?: AppLogger
  }
}

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public constructor(props: AppErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  public static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const isDevelopment = import.meta.env.DEV

    const context: Record<string, unknown> = {
      name: error.name,
      message: error.message,
      componentStack: errorInfo.componentStack,
    }

    if (isDevelopment) {
      context.stack = error.stack
    }

    window.__APP_LOGGER__?.error('app_error_boundary', context)

    if (!window.__APP_LOGGER__) {
      console.error('app_error_boundary', context)
    }
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  private handleGoHome = (): void => {
    window.location.assign(this.props.homePath ?? import.meta.env.BASE_URL ?? '/')
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  public render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children
    }

    const isDevelopment = import.meta.env.DEV

    const devDetails =
      isDevelopment && this.state.error
        ? `${this.state.error.toString()}${this.state.error.stack ? `\n\n${this.state.error.stack}` : ''}`
        : undefined

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <StateCard
            icon={AlertTriangle}
            variant="error"
            title="אירעה שגיאה בלתי צפויה"
            message="אנו מתנצלים על אי הנוחות. צוות הפיתוח קיבל התראה על הבעיה."
            details={devDetails}
            action={{ label: 'טען מחדש את הדף', onClick: this.handleReload }}
            secondaryAction={{ label: 'חזור לדף הבית', onClick: this.handleGoHome }}
          />

          {isDevelopment && (
            <div className="mt-3 text-center">
              <button className="text-sm text-gray-500 hover:text-gray-700 underline" onClick={this.handleReset}>
                נסה שוב ללא רענון
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }
}
