import { useState } from 'react'
import { PlusCircle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { Divider } from '@/components/ui/primitives/Divider'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { ADVANCE_PAYMENT_FREQUENCY_PREFIX, ADVANCE_PAYMENT_FREQUENCY_UNSET_TEXT } from '../../constants'
import { getMonthsCoveredLabel } from '@/constants/periodOptions.constants'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface ClientAdvancePaymentsHeaderProps {
  isAdvisor: boolean
  year: number
  onOpenCreate: () => void
  onGenerateSchedule: () => void
  displayFrequency: 1 | 2 | null
  generationFrequency: 1 | 2 | null
  isGenerating?: boolean
  advanceRate?: number | null
}

export const ClientAdvancePaymentsHeader: React.FC<ClientAdvancePaymentsHeaderProps> = ({
  isAdvisor,
  year,
  onOpenCreate,
  onGenerateSchedule,
  displayFrequency,
  generationFrequency,
  isGenerating,
  advanceRate,
}) => {
  const [confirmGenerate, setConfirmGenerate] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {isAdvisor && (
          <>
            <Button type="button" icon={<PlusCircle className="h-4 w-4" />} onClick={onOpenCreate}>
              {ADVANCED_PAYMENTS_MESSAGES.clientHeader.addPayment}
            </Button>
            <Divider orientation="vertical" className="h-8 hidden sm:block" />
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <span className="px-3 py-1.5 text-sm text-gray-500">
                {displayFrequency != null ? (
                  <>
                    {ADVANCE_PAYMENT_FREQUENCY_PREFIX}{' '}
                    <span className="font-semibold text-gray-800">{getMonthsCoveredLabel(displayFrequency)}</span>
                  </>
                ) : (
                  <span className="text-gray-400">{ADVANCE_PAYMENT_FREQUENCY_UNSET_TEXT}</span>
                )}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<Calendar className="h-3.5 w-3.5" />}
                onClick={() => setConfirmGenerate(true)}
                disabled={generationFrequency == null}
                isLoading={isGenerating}
                loadingLabel={ADVANCED_PAYMENTS_MESSAGES.clientHeader.loadingLabel}
                tooltip={
                  generationFrequency == null ? ADVANCED_PAYMENTS_MESSAGES.clientHeader.noFrequencyTooltip : undefined
                }
                className="rounded-lg text-gray-700 hover:bg-white hover:shadow-sm"
              >
                {ADVANCED_PAYMENTS_MESSAGES.clientHeader.createYearlySchedule}
              </Button>
            </div>
            {generationFrequency != null && (
              <ConfirmDialog
                open={confirmGenerate}
                title={ADVANCED_PAYMENTS_MESSAGES.clientHeader.confirmTitle}
                message={ADVANCED_PAYMENTS_MESSAGES.clientHeader.confirmMessage(
                  getMonthsCoveredLabel(generationFrequency)!,
                  year,
                )}
                confirmLabel={ADVANCED_PAYMENTS_MESSAGES.clientHeader.confirmButton}
                cancelLabel={GLOBAL_UI_MESSAGES.actions.cancel}
                onConfirm={() => {
                  setConfirmGenerate(false)
                  onGenerateSchedule()
                }}
                onCancel={() => setConfirmGenerate(false)}
              />
            )}
          </>
        )}
      </div>

      {advanceRate != null && (
        <p className="text-sm text-gray-500">{ADVANCED_PAYMENTS_MESSAGES.clientHeader.advanceRateNote(advanceRate)}</p>
      )}
    </div>
  )
}
