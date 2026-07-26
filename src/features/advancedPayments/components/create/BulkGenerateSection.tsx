import { Spinner } from '@/components/ui/primitives/Spinner'
import { ProgressBar } from '@/components/ui/primitives/ProgressBar'
import { InlineState } from '@/components/ui/feedback/InlineState'
import { Alert } from '@/components/ui/overlays/Alert'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../../errorMessages'
import type { BulkGenerateTotals } from '../../hooks/useBulkGenerateSchedule'
import type { IneligibleClient } from '../../api/contracts'

interface BulkGenerateSectionProps {
  isPreviewLoading: boolean
  previewError: unknown
  eligibleCount: number
  ineligible: IneligibleClient[]
  totals: BulkGenerateTotals | null
  isRunning: boolean
  isDone: boolean
}

const MESSAGES = ADVANCED_PAYMENTS_MESSAGES.bulkGenerate

export const BulkGenerateSection: React.FC<BulkGenerateSectionProps> = ({
  isPreviewLoading,
  previewError,
  eligibleCount,
  ineligible,
  totals,
  isRunning,
  isDone,
}) => {
  if (isPreviewLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
        <Spinner size="sm" />
        {MESSAGES.loadingPreview}
      </div>
    )
  }

  if (previewError !== null) {
    return <InlineState variant="error" title={ADVANCED_PAYMENTS_ERROR_MESSAGES.bulkGenerate.previewLoad} />
  }

  const processed = totals?.clientsProcessed ?? 0

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        {eligibleCount > 0 ? MESSAGES.eligibleCount(eligibleCount) : MESSAGES.noEligibleClients}
      </p>

      {/* The bar is meaningful only while the office is being walked; once the run
          is done the counts below say more than a full bar would. */}
      {isRunning && (
        <div className="space-y-1.5">
          <ProgressBar value={eligibleCount === 0 ? 0 : (processed / eligibleCount) * 100} />
          <p className="text-xs text-gray-500">{MESSAGES.runningProgress({ processed, total: eligibleCount })}</p>
        </div>
      )}

      {isDone && totals !== null && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-800">
            {MESSAGES.doneSummary({ clients: totals.clientsProcessed, created: totals.created })}
          </p>
          {totals.skipped > 0 && <p className="text-xs text-gray-500">{MESSAGES.skippedNote(totals.skipped)}</p>}
        </div>
      )}

      {totals !== null && totals.failed.length > 0 && (
        <Alert
          variant="error"
          size="sm"
          message={
            <div className="space-y-1">
              <p className="font-medium">{MESSAGES.failedTitle(totals.failed.length)}</p>
              <ul className="space-y-0.5">
                {totals.failed.map((item) => (
                  <li key={item.client_record_id}>
                    {item.client_name} — {item.reason}
                  </li>
                ))}
              </ul>
            </div>
          }
        />
      )}

      {/* Shown before the run as much as after it: a client with no frequency gets
          no schedule at all, and the advisor is the one who has to go fix it. */}
      {ineligible.length > 0 && (
        <Alert
          variant="warning"
          size="sm"
          message={
            <div className="space-y-1">
              <p className="font-medium">{MESSAGES.ineligibleTitle(ineligible.length)}</p>
              <ul className="max-h-40 space-y-0.5 overflow-y-auto">
                {ineligible.map((item) => (
                  <li key={item.client_record_id}>{item.client_name}</li>
                ))}
              </ul>
              <p className="text-xs">{MESSAGES.ineligibleNote}</p>
            </div>
          }
        />
      )}
    </div>
  )
}
