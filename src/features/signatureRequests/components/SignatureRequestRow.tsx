import { useState } from 'react'
import { ChevronDown, ChevronUp, Link2 } from 'lucide-react'
import { Button } from '../../../components/ui/primitives/Button'
import { StatusBadge } from '../../../components/ui/primitives/StatusBadge'
import { getSignatureRequestTypeLabel, getSignatureRequestStatusLabel } from '../constants'
import { formatDate, formatDateTime } from '../../../utils/utils'
import { signatureRequestStatusVariants } from '../utils'
import { SignatureRequestRowActions, type SignatureRequestActionProps } from './SignatureRequestRowActions'

// ── Shared field row for expanded details ─────────────────────────────────────

const FieldRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex gap-2 text-xs">
    <span className="w-20 shrink-0 font-medium text-gray-600">{label}</span>
    <span className="text-gray-700">{value}</span>
  </div>
)

// ── Main component ────────────────────────────────────────────────────────────

type Props = SignatureRequestActionProps

export const SignatureRequestRow: React.FC<Props> = ({
  request,
  signingUrl,
  isCanceling,
  canManage,
  onCancel,
  onAudit,
}) => {
  const [expanded, setExpanded] = useState(false)
  const isPending = request.status === 'pending_signature'

  return (
    <div className="rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-sm">
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold text-gray-900">{request.title}</span>
            <StatusBadge
              status={request.status}
              getLabel={getSignatureRequestStatusLabel}
              variantMap={signatureRequestStatusVariants}
            />
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            {getSignatureRequestTypeLabel(request.request_type)} · {request.signer_name} ·{' '}
            {formatDate(request.created_at)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <SignatureRequestRowActions
            request={request}
            signingUrl={signingUrl}
            isCanceling={isCanceling}
            canManage={canManage}
            onCancel={onCancel}
            onAudit={onAudit}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 text-gray-400 hover:text-gray-600"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="space-y-2 border-t border-gray-100 bg-gray-50/60 px-4 pb-4 pt-3">
          {request.description && <FieldRow label="תיאור" value={request.description} />}
          {request.signer_email && <FieldRow label='דוא"ל' value={request.signer_email} />}
          {request.expires_at && <FieldRow label="תפוגה" value={formatDate(request.expires_at)} />}
          {request.sent_at && (
            <FieldRow label="נשלח" value={<span className="tabular-nums">{formatDateTime(request.sent_at)}</span>} />
          )}
          {request.signed_at && (
            <FieldRow label="נחתם" value={<span className="tabular-nums">{formatDateTime(request.signed_at)}</span>} />
          )}
          {request.decline_reason && <FieldRow label="סיבת דחייה" value={request.decline_reason} />}
          {isPending && signingUrl && (
            <div className="flex items-center gap-2 pt-1">
              <Link2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span className="break-all text-xs text-primary-600">{signingUrl}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
SignatureRequestRow.displayName = 'SignatureRequestRow'
