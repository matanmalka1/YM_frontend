import { useParams } from 'react-router-dom'
import { FileSignature } from 'lucide-react'
import { Card } from '@/components/ui/primitives/Card'
import { SigningForm, SigningStatus, useSigningPageState, type SigningTerminalState } from '@/features/signing'

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Card size="compact" className="w-full max-w-md">
    {children}
  </Card>
)

const TERMINAL_STATES: SigningTerminalState[] = ['loading', 'error', 'signed', 'declined']

export const SigningPage: React.FC = () => {
  const { token } = useParams<{ token: string }>()
  const {
    data,
    status,
    effectiveState,
    pageState,
    declineReason,
    isExpired,
    isApproving,
    isDeclining,
    setDeclineReason,
    startApprove,
    startDecline,
    backToReady,
    confirmApprove,
    confirmDecline,
  } = useSigningPageState(token)

  const terminalState = TERMINAL_STATES.find((state) => state === effectiveState)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-primary-50/30 to-indigo-50 p-4">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 shadow-md">
          <FileSignature className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">חתימה דיגיטלית</h1>
          <p className="mt-0.5 text-xs text-gray-500">מערכת ניהול משרד · מאובטח ומוצפן</p>
        </div>
      </div>

      <Shell>
        {terminalState ? (
          <SigningStatus state={terminalState} status={status} />
        ) : (
          data && (
            <SigningForm
              data={data}
              pageState={pageState}
              isExpired={isExpired}
              declineReason={declineReason}
              onDeclineReasonChange={setDeclineReason}
              onStartApprove={startApprove}
              onStartDecline={startDecline}
              onBack={backToReady}
              onConfirmApprove={confirmApprove}
              onConfirmDecline={confirmDecline}
              isApproving={isApproving}
              isDeclining={isDeclining}
            />
          )
        )}
      </Shell>

      <p className="mt-8 text-center text-xs text-gray-400">מערכת ניהול משרד · חתימה מאובטחת ומוצפנת</p>
    </div>
  )
}
