import { useState } from 'react'
import { Bell, Link2, Copy, Check, X, History } from 'lucide-react'
import { RowActionGroup, RowActionItem, RowActionLink, RowActionsMenu } from '@/components/ui/table'
import { toast } from '../../../utils/toast'
import type { SignatureRequestResponse } from '../api'

interface SignatureRequestRowActionsProps {
  request: SignatureRequestResponse
  signingUrl?: string
  isCanceling: boolean
  canManage: boolean
  onCancelRequest: () => void
  onAudit: (id: number) => void
  onSendNotification?: (id: number, trigger: 'signature_request_sent' | 'signature_request_reminder') => void
  showOpenLink?: boolean
  copySuccessMessage?: string | null
}

export const SignatureRequestRowActions: React.FC<SignatureRequestRowActionsProps> = ({
  request,
  signingUrl,
  isCanceling,
  canManage,
  onCancelRequest,
  onAudit,
  onSendNotification,
  showOpenLink = false,
  copySuccessMessage = 'הקישור הועתק',
}) => {
  const [copied, setCopied] = useState(false)

  const isPending = request.status === 'pending_signature'
  const hasLinkActions = isPending && Boolean(signingUrl)
  const hasNotificationActions = canManage && isPending && Boolean(onSendNotification)
  const hasCancelAction = canManage && isPending

  const handleCopy = async () => {
    if (!signingUrl) return
    try {
      await navigator.clipboard.writeText(signingUrl)
    } catch {
      return
    }
    setCopied(true)
    if (copySuccessMessage) {
      toast.success(copySuccessMessage)
    }
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <RowActionsMenu ariaLabel={`פעולות לבקשת חתימה ${request.id}`}>
      <RowActionGroup>
        {hasLinkActions && (
          <>
            {showOpenLink && (
              <RowActionLink
                href={signingUrl!}
                target="_blank"
                rel="noopener noreferrer"
                label="פתח קישור"
                icon={<Link2 className="h-4 w-4" />}
              />
            )}
            <RowActionItem
              label={copied ? 'הועתק!' : 'העתק קישור'}
              onClick={() => void handleCopy()}
              icon={copied ? <Check className="h-4 w-4 text-positive-700" /> : <Copy className="h-4 w-4" />}
            />
          </>
        )}
      </RowActionGroup>
      <RowActionGroup>
        {hasNotificationActions && (
          <>
            <RowActionItem
              label="שלח בקשת חתימה"
              onClick={() => onSendNotification!(request.id, 'signature_request_sent')}
              icon={<Bell className="h-4 w-4" />}
              disabled={isCanceling}
            />
            <RowActionItem
              label="שלח תזכורת לחתימה"
              onClick={() => onSendNotification!(request.id, 'signature_request_reminder')}
              icon={<Bell className="h-4 w-4" />}
              disabled={isCanceling}
            />
          </>
        )}
      </RowActionGroup>
      <RowActionGroup>
        <RowActionItem
          label="היסטוריית פעילות"
          onClick={() => onAudit(request.id)}
          icon={<History className="h-4 w-4" />}
        />
      </RowActionGroup>
      <RowActionGroup>
        {hasCancelAction && (
          <RowActionItem
            label="בטל בקשה"
            onClick={onCancelRequest}
            icon={<X className="h-4 w-4" />}
            danger
            disabled={isCanceling}
          />
        )}
      </RowActionGroup>
    </RowActionsMenu>
  )
}

SignatureRequestRowActions.displayName = 'SignatureRequestRowActions'
