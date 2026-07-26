import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/overlays/Modal'
import { Button } from '@/components/ui/primitives/Button'
import { Select } from '@/components/ui/inputs/Select'
import { Alert } from '@/components/ui/overlays/Alert'
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/primitives/SegmentedControl'
import { ClientSearchInput } from '@/features/clients/public'
import { useGenerateSchedule } from '../../hooks/useGenerateSchedule'
import { useBulkGenerateSchedule } from '../../hooks/useBulkGenerateSchedule'
import { BulkGenerateSection } from './BulkGenerateSection'
import { ADVANCE_PAYMENT_FREQUENCY_PREFIX, ADVANCE_PAYMENT_FREQUENCY_UNSET_TEXT } from '../../constants'
import { getMonthsCoveredLabel, getOperationalTaxYear } from '@/constants/periodOptions.constants'
import { getForwardLookingYearOptions } from '../../utils/advancePaymentComponentUtils'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../../errorMessages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface Props {
  open: boolean
  onClose: () => void
}

type GenerateMode = 'client' | 'office'

const MESSAGES = ADVANCED_PAYMENTS_MESSAGES.generateScheduleModal
const STALE_MESSAGES = ADVANCED_PAYMENTS_MESSAGES.staleCadence

export const GenerateScheduleModal: React.FC<Props> = ({ open, onClose }) => {
  const [mode, setMode] = useState<GenerateMode>('client')
  // The year is chosen here rather than inherited from the page filter: this
  // action is run at the turn of a tax year, when the filter still points at
  // the outgoing one.
  const [year, setYear] = useState(String(getOperationalTaxYear()))

  // The modal stays open when a frequency change blocked the run, so the
  // confirmation is visible; it closes only once something actually generated.
  const single = useGenerateSchedule(Number(year), onClose)
  const bulk = useBulkGenerateSchedule(open && mode === 'office')

  const handleClose = () => {
    single.picker.resetClientPicker()
    onClose()
  }

  const { reset: resetSingle } = single
  useEffect(() => {
    if (open) {
      setMode('client')
      setYear(String(getOperationalTaxYear()))
      resetSingle()
    }
  }, [open, resetSingle])

  const isSingleDisabled =
    single.picker.selectedClient === null ||
    single.isProfileLoading ||
    single.isProfileError ||
    single.frequency == null ||
    single.isPending

  return (
    <Modal
      open={open}
      title={MESSAGES.title}
      onClose={handleClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={bulk.isRunning} onClick={handleClose}>
            {bulk.isDone ? GLOBAL_UI_MESSAGES.actions.close : GLOBAL_UI_MESSAGES.actions.cancel}
          </Button>
          {mode === 'client' ? (
            <Button variant="primary" isLoading={single.isPending} disabled={isSingleDisabled} onClick={single.handleGenerate}>
              {MESSAGES.createButton}
            </Button>
          ) : (
            <Button
              variant="primary"
              isLoading={bulk.isRunning}
              disabled={bulk.isRunning || bulk.isDone || bulk.eligibleCount === 0}
              onClick={() => bulk.generate(Number(year))}
            >
              {ADVANCED_PAYMENTS_MESSAGES.bulkGenerate.createButton}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <SegmentedControl variant="switch">
          <SegmentedControlItem
            variant="switch"
            selected={mode === 'client'}
            disabled={bulk.isRunning}
            onClick={() => setMode('client')}
          >
            {MESSAGES.singleClientMode}
          </SegmentedControlItem>
          <SegmentedControlItem
            variant="switch"
            selected={mode === 'office'}
            disabled={bulk.isRunning}
            onClick={() => setMode('office')}
          >
            {MESSAGES.officeMode}
          </SegmentedControlItem>
        </SegmentedControl>

        <Select
          label={MESSAGES.yearLabel}
          options={getForwardLookingYearOptions()}
          value={year}
          disabled={bulk.isRunning}
          onChange={(event) => setYear(event.target.value)}
        />

        {mode === 'client' ? (
          <>
            <ClientSearchInput
              selectedClient={single.picker.selectedClient}
              value={single.picker.clientQuery}
              onChange={single.picker.handleClientQueryChange}
              onSelect={single.picker.handleSelectClient}
              onClear={single.picker.handleClearClient}
            />
            {single.picker.selectedClient !== null && (
              <p className="text-sm text-gray-500">
                {single.isProfileLoading
                  ? MESSAGES.loadingProfile
                  : single.isProfileError
                    ? ADVANCED_PAYMENTS_ERROR_MESSAGES.generateSchedule.profileLoad
                    : single.frequency != null
                      ? `${ADVANCE_PAYMENT_FREQUENCY_PREFIX} ${getMonthsCoveredLabel(single.frequency)}`
                      : ADVANCE_PAYMENT_FREQUENCY_UNSET_TEXT}
              </p>
            )}
            {/* The run wrote nothing: the client's frequency changed and the old
                cadence still occupies the periods. Deleting is opt-in. */}
            {single.staleCadence !== null && (
              <Alert
                variant="warning"
                size="sm"
                message={
                  <div className="space-y-2">
                    <p className="font-medium">{STALE_MESSAGES.confirmTitle}</p>
                    <p className="text-xs">{STALE_MESSAGES.confirmMessage(single.staleCadence.pending)}</p>
                    {single.staleCadence.settled > 0 && (
                      <p className="text-xs">{STALE_MESSAGES.settledNote(single.staleCadence.settled)}</p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={single.isPending}
                      disabled={single.isPending}
                      onClick={single.handleConfirmCleanup}
                    >
                      {STALE_MESSAGES.confirmButton}
                    </Button>
                  </div>
                }
              />
            )}
          </>
        ) : (
          <BulkGenerateSection
            isPreviewLoading={bulk.isPreviewLoading}
            previewError={bulk.previewError}
            eligibleCount={bulk.eligibleCount}
            ineligible={bulk.ineligible}
            totals={bulk.totals}
            isRunning={bulk.isRunning}
            isDone={bulk.isDone}
            onConfirmCleanup={() => bulk.confirmCleanup(Number(year))}
          />
        )}

        <p className="text-sm text-gray-500">{MESSAGES.scheduleNote}</p>
      </div>
    </Modal>
  )
}
