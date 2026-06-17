import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { Spinner } from '@/components/ui/primitives/Spinner'
import type { SignatureRequestStatus } from '@/features/signatureRequests'
import type { SigningTerminalState } from '../types'

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
        <p className="text-sm text-gray-500">טוען מסמך...</p>
      </div>
    )
  }

  if (state === 'signed') {
    return (
      <StatusIllustration
        icon={<CheckCircle2 className="h-8 w-8 text-positive-700" />}
        bg="bg-positive-100"
        title={title ?? 'המסמך נחתם בהצלחה'}
        body={body ?? 'תודה! חתימתך נקלטה במערכת.'}
      />
    )
  }

  if (state === 'declined') {
    return (
      <StatusIllustration
        icon={<XCircle className="h-8 w-8 text-gray-500" />}
        bg="bg-gray-100"
        title={title ?? 'הבקשה נדחתה'}
        body={body ?? 'דחית את בקשת החתימה. פנה למשרד לפרטים נוספים.'}
      />
    )
  }

  return (
    <StatusIllustration
      icon={<AlertTriangle className="h-8 w-8 text-negative-500" />}
      bg="bg-negative-100"
      title={title ?? (status === 'expired' ? 'הקישור פג תוקף' : 'בקשה לא זמינה')}
      body={
        body ??
        (status === 'expired'
          ? 'קישור זה לחתימה פג תוקפו. פנה למשרד לקבלת קישור חדש.'
          : 'הקישור שגוי, בוטל, או שאירעה שגיאה. פנה למשרד לבירור.')
      }
    />
  )
}
