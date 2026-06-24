import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react'
import type { SignerViewResponse } from '@/features/signatureRequests'
import { Alert } from '../../../components/ui/overlays/Alert'
import { DefinitionList } from '../../../components/ui/layout/DefinitionList'
import { Button } from '../../../components/ui/primitives/Button'
import { Textarea } from '../../../components/ui/inputs/Textarea'
import { formatDate } from '../../../utils/utils'
import type { SigningPageState } from '../types'
import { SIGNING_MESSAGES } from '../messages'

interface SigningFormProps {
  data: SignerViewResponse
  pageState: SigningPageState
  isExpired: boolean
  declineReason: string
  onDeclineReasonChange: (value: string) => void
  onStartApprove: () => void
  onStartDecline: () => void
  onBack: () => void
  onConfirmApprove: () => void
  onConfirmDecline: () => void
  isApproving: boolean
  isDeclining: boolean
}

export const SigningForm: React.FC<SigningFormProps> = ({
  data,
  pageState,
  isExpired,
  declineReason,
  onDeclineReasonChange,
  onStartApprove,
  onStartDecline,
  onBack,
  onConfirmApprove,
  onConfirmDecline,
  isApproving,
  isDeclining,
}) => {
  if (pageState === 'confirming_approve') {
    return (
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-positive-100">
            <CheckCircle2 className="h-7 w-7 text-positive-700" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{SIGNING_MESSAGES.confirmApprove.title}</h2>
          <p className="text-sm text-gray-500">{SIGNING_MESSAGES.confirmApprove.message(data.title)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onBack} className="flex-1" disabled={isApproving}>
            {SIGNING_MESSAGES.confirmApprove.back}
          </Button>
          <Button variant="primary" size="md" isLoading={isApproving} onClick={onConfirmApprove} className="flex-[2]">
            {SIGNING_MESSAGES.confirmApprove.submit}
          </Button>
        </div>
      </div>
    )
  }

  if (pageState === 'confirming_decline') {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-negative-100">
            <XCircle className="h-7 w-7 text-negative-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{SIGNING_MESSAGES.confirmDecline.title}</h2>
          <p className="text-sm text-gray-500">{SIGNING_MESSAGES.confirmDecline.message}</p>
        </div>
        <Textarea
          label={SIGNING_MESSAGES.confirmDecline.reasonLabel}
          value={declineReason}
          onChange={(e) => onDeclineReasonChange(e.target.value)}
          placeholder={SIGNING_MESSAGES.confirmDecline.reasonPlaceholder}
          rows={3}
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onBack} className="flex-1" disabled={isDeclining}>
            {SIGNING_MESSAGES.confirmApprove.back}
          </Button>
          <Button
            variant="outline"
            size="md"
            isLoading={isDeclining}
            onClick={onConfirmDecline}
            className="flex-[2] border-negative-200 bg-negative-50 text-negative-700 hover:bg-negative-100"
          >
            {SIGNING_MESSAGES.confirmDecline.submit}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <h2 className="font-semibold text-gray-900">{data.title}</h2>
        {data.description && <p className="mt-2 text-sm leading-relaxed text-gray-700">{data.description}</p>}
      </div>

      <DefinitionList
        layout="stacked"
        items={[
          { label: SIGNING_MESSAGES.details.signerName, value: data.signer_name },
          ...(data.expires_at
            ? [
                {
                  label: SIGNING_MESSAGES.details.expiresAt,
                  value: (
                    <span className={isExpired ? 'text-negative-600' : undefined}>
                      {isExpired ? SIGNING_MESSAGES.details.expired : formatDate(data.expires_at)}
                    </span>
                  ),
                },
              ]
            : []),
        ]}
      />

      {isExpired && <Alert variant="error" size="sm" message={SIGNING_MESSAGES.details.expiredAlert} />}

      {!isExpired && (
        <>
          <Alert variant="info" size="sm" icon={ShieldCheck} message={SIGNING_MESSAGES.details.legalNotice} />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<XCircle className="h-4 w-4" />}
              onClick={onStartDecline}
              className="flex-1 border-negative-200 text-negative-600 hover:bg-negative-50"
            >
              {SIGNING_MESSAGES.details.decline}
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<CheckCircle2 className="h-4 w-4" />}
              isLoading={isApproving}
              onClick={onStartApprove}
              className="flex-[2]"
            >
              {SIGNING_MESSAGES.details.approve}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
