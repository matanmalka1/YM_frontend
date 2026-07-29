import { useState } from 'react'
import { ArrowLeftCircle, Ban, CheckCircle2, Lock, RotateCcw, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { Card } from '@/components/ui/primitives/Card'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { Textarea } from '@/components/ui/inputs/Textarea'
import { cn } from '@/utils/utils'
import { useRole } from '@/hooks/useRole'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import {
  getObligationStatusLabel,
  isObligationLocked,
  nextObligationStage,
  previousObligationStage,
} from '@/constants/obligationStatus.constants'
import type { AdvancePaymentRow } from '../../api/contracts'
import { useAdvancePaymentStatusActions } from '../../hooks/useAdvancePaymentStatusActions'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface AdvancePaymentStatusPanelProps {
  payment: AdvancePaymentRow
}

/**
 * Advisor stage controls for one advance payment — forward a stage, close
 * (gated by the shared closing readiness), send back with a reason, cancel.
 * The shared graph on the server owns legality; this panel only offers the
 * single-step moves it would accept.
 */
export const AdvancePaymentStatusPanel: React.FC<AdvancePaymentStatusPanelProps> = ({ payment }) => {
  const messages = ADVANCED_PAYMENTS_MESSAGES.statusPanel
  const { isAdvisor } = useRole()
  const [confirmSendBack, setConfirmSendBack] = useState(false)
  const [sendBackNote, setSendBackNote] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)

  const isLocked = isObligationLocked(payment.status)
  const isCanceled = payment.status === 'canceled'
  const next = nextObligationStage(payment.status)
  const previous = previousObligationStage(payment.status)
  const closeIsNext = next === 'submitted'

  const { readiness, transition, isTransitioning } = useAdvancePaymentStatusActions({
    clientRecordId: payment.client_record_id,
    paymentId: payment.id,
    readinessEnabled: isAdvisor && closeIsNext && !isLocked,
  })

  if (!isAdvisor || isCanceled) return null

  if (isLocked) {
    return (
      <Card title={messages.title}>
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <Lock className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
          <span>{messages.lockedNotice}</span>
        </div>
      </Card>
    )
  }

  const closeBlocked = closeIsNext && readiness.data != null && !readiness.data.is_ready

  return (
    <Card title={messages.title}>
      <div className="space-y-3">
        {closeIsNext && (
          <div className="space-y-1.5">
            {readiness.isLoading ? (
              <p className="text-sm text-gray-400">{messages.readinessLoading}</p>
            ) : readiness.data ? (
              <>
                <div
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium',
                    readiness.data.is_ready ? semanticMonoToneClasses.positive : semanticMonoToneClasses.negative,
                  )}
                >
                  {readiness.data.is_ready ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{messages.readinessReady}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 shrink-0" />
                      <span>{messages.readinessNotReady(readiness.data.issues.length)}</span>
                    </>
                  )}
                </div>
                {readiness.data.issues.length > 0 && (
                  <ul className="space-y-1">
                    {readiness.data.issues.map((issue) => (
                      <li key={issue} className="flex items-start gap-1.5 text-sm text-negative-700">
                        <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-negative-400" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : null}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {next && (
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowLeftCircle className="h-4 w-4" />}
              isLoading={isTransitioning}
              disabled={closeBlocked}
              onClick={() => void transition(next)}
            >
              {closeIsNext ? messages.close : messages.advanceStage(getObligationStatusLabel(next))}
            </Button>
          )}
          {previous && (
            <Button
              variant="secondary"
              size="sm"
              icon={<RotateCcw className="h-4 w-4" />}
              disabled={isTransitioning}
              onClick={() => setConfirmSendBack(true)}
            >
              {messages.sendBack}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={<Ban className="h-4 w-4" />}
            disabled={isTransitioning}
            onClick={() => setConfirmCancel(true)}
          >
            {messages.cancel}
          </Button>
        </div>
      </div>

      {previous && (
        <ConfirmDialog
          open={confirmSendBack}
          title={messages.sendBackModalTitle}
          message={messages.sendBack}
          confirmLabel={messages.sendBackConfirm}
          isLoading={isTransitioning}
          confirmDisabled={!sendBackNote.trim()}
          onConfirm={async () => {
            await transition(previous, sendBackNote.trim())
            setConfirmSendBack(false)
            setSendBackNote('')
          }}
          onCancel={() => {
            setConfirmSendBack(false)
            setSendBackNote('')
          }}
        >
          <Textarea
            className="mt-3 resize-none"
            rows={3}
            placeholder={messages.sendBackReasonPlaceholder}
            value={sendBackNote}
            onChange={(event) => setSendBackNote(event.target.value)}
          />
        </ConfirmDialog>
      )}

      <ConfirmDialog
        open={confirmCancel}
        title={messages.cancelModalTitle}
        message={messages.cancelModalMessage}
        confirmLabel={messages.cancelConfirm}
        confirmVariant="danger"
        isLoading={isTransitioning}
        onConfirm={async () => {
          await transition('canceled')
          setConfirmCancel(false)
        }}
        onCancel={() => setConfirmCancel(false)}
      />
    </Card>
  )
}

AdvancePaymentStatusPanel.displayName = 'AdvancePaymentStatusPanel'
