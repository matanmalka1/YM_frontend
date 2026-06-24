import type { ReactNode, FC } from 'react'
import { PageLoading } from './PageLoading'
import { Alert } from '../overlays/Alert'
import { GLOBAL_UI_MESSAGES } from '../../../messages'

interface PageStateGuardProps {
  isLoading: boolean
  error: string | null
  header: ReactNode
  loadingMessage?: string
  children: ReactNode
}

export const PageStateGuard: FC<PageStateGuardProps> = ({
  isLoading,
  error,
  header,
  loadingMessage = GLOBAL_UI_MESSAGES.common.loading,
  children,
}) => {
  return (
    <div className="space-y-6">
      {header}
      {isLoading && <PageLoading message={loadingMessage} />}
      {error && <Alert variant="error" message={error} />}
      {!isLoading && !error && children}
    </div>
  )
}
