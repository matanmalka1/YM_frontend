import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react'
import type { SignerViewResponse } from '@/features/signatureRequests'
import { Alert } from '../../../components/ui/overlays/Alert'
import { Button } from '../../../components/ui/primitives/Button'
import { Textarea } from '../../../components/ui/inputs/Textarea'
import { formatDate } from '../../../utils/utils'
import type { SigningPageState } from '../types'

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
          <h2 className="text-lg font-semibold text-gray-900">אישור חתימה</h2>
          <p className="text-sm text-gray-500">האם אתה/ת בטוח/ה שברצונך לחתום על "{data.title}"?</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onBack} className="flex-1" disabled={isApproving}>
            חזרה
          </Button>
          <Button variant="primary" size="md" isLoading={isApproving} onClick={onConfirmApprove} className="flex-[2]">
            כן, אני חותם/ת
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
          <h2 className="text-lg font-semibold text-gray-900">דחיית בקשה</h2>
          <p className="text-sm text-gray-500">האם אתה/ת בטוח/ה שברצונך לדחות את בקשת החתימה?</p>
        </div>
        <Textarea
          label="סיבת דחייה (אופציונלי)"
          value={declineReason}
          onChange={(e) => onDeclineReasonChange(e.target.value)}
          placeholder="תאר/י את הסיבה לדחייה..."
          rows={3}
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onBack} className="flex-1" disabled={isDeclining}>
            חזרה
          </Button>
          <Button
            variant="outline"
            size="md"
            isLoading={isDeclining}
            onClick={onConfirmDecline}
            className="flex-[2] border-negative-200 bg-negative-50 text-negative-700 hover:bg-negative-100"
          >
            דחיית הבקשה
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

      <dl className="space-y-2">
        <div className="flex justify-between text-sm">
          <dt className="text-gray-500">שם החותם</dt>
          <dd className="font-medium text-gray-900">{data.signer_name}</dd>
        </div>
        {data.expires_at && (
          <div className="flex justify-between text-sm">
            <dt className="text-gray-500">תוקף הקישור</dt>
            <dd className={`font-medium ${isExpired ? 'text-negative-600' : 'text-gray-900'}`}>
              {isExpired ? 'פג תוקף' : formatDate(data.expires_at)}
            </dd>
          </div>
        )}
      </dl>

      {isExpired && (
        <Alert variant="error" size="sm" message="קישור זה פג תוקפו. לא ניתן לחתום. פנה למשרד לחידוש הבקשה." />
      )}

      {!isExpired && (
        <>
          <Alert
            variant="info"
            size="sm"
            icon={ShieldCheck}
            message={
              'בלחיצה על "אני מאשר/ת וחותם/ת" הנך מאשר/ת את תוכן המסמך ומסכים/ה לחתימה דיגיטלית מחייבת בהתאם לחוק חתימה אלקטרונית (התשס"א-2001).'
            }
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<XCircle className="h-4 w-4" />}
              onClick={onStartDecline}
              className="flex-1 border-negative-200 text-negative-600 hover:bg-negative-50"
            >
              דחייה
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<CheckCircle2 className="h-4 w-4" />}
              isLoading={isApproving}
              onClick={onStartApprove}
              className="flex-[2]"
            >
              אני מאשר/ת וחותם/ת
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
