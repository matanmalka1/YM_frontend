import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { Spinner } from '@/components/ui/primitives/Spinner'
import type { SignatureRequestStatus } from '@/features/signatureRequests'
import type { SigningTerminalState } from '../types'
import { SIGNING_MESSAGES } from '../messages'
import { SIGNING_ERROR_MESSAGES } from '../errorMessages'

interface StatusIllustrationProps {
  icon: React.ReactNode
  bg: string
  title: string
  body: string
}

const StatusIllustration: React.FC<StatusIllustrationProps> = ({ icon, bg, title, body }) => (
  <div className="flex flex-col items-center gap-3 py-6 text-center">
    <div className={`flex h-16 w-16 items-center justify-center rounded-full ${bg}`}>{icon}</div>
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    <p className="max-w-xs text-sm text-gray-500">{body}</p>
  </div>
)

interface SigningStatusProps {
  state: SigningTerminalState
  status?: SignatureRequestStatus
  title?: string
  body?: string
}

export const SigningStatus: React.FC<SigningStatusProps> = ({ state, status, title, body }) => {
  if (state === 'loading') {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500">{SIGNING_MESSAGES.status.loading}</p>
      </div>
    )
  }

  if (state === 'signed') {
    return (
      <StatusIllustration
        icon={<CheckCircle2 className="h-8 w-8 text-positive-700" />}
        bg="bg-positive-100"
        title={title ?? SIGNING_MESSAGES.status.signedTitle}
        body={body ?? SIGNING_MESSAGES.status.signedBody}
      />
    )
  }

  if (state === 'declined') {
    return (
      <StatusIllustration
        icon={<XCircle className="h-8 w-8 text-gray-500" />}
        bg="bg-gray-100"
        title={title ?? SIGNING_MESSAGES.status.declinedTitle}
        body={body ?? SIGNING_MESSAGES.status.declinedBody}
      />
    )
  }

  return (
    <StatusIllustration
      icon={<AlertTriangle className="h-8 w-8 text-negative-500" />}
      bg="bg-negative-100"
      title={
        title ??
        (status === 'expired'
          ? SIGNING_ERROR_MESSAGES.status.expiredTitle
          : SIGNING_ERROR_MESSAGES.status.unavailableTitle)
      }
      body={
        body ??
        (status === 'expired'
          ? SIGNING_ERROR_MESSAGES.status.expiredBody
          : SIGNING_ERROR_MESSAGES.status.unavailableBody)
      }
    />
  )
}
