import { Button } from '../../../../components/ui/primitives/Button'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface AnnualReportVatAutoPopulateControlsProps {
  showForceConfirm: boolean
  isPending: boolean
  onPopulate: (force: boolean) => void
  onCancelForce: () => void
}

export const AnnualReportVatAutoPopulateControls: React.FC<AnnualReportVatAutoPopulateControlsProps> = ({
  showForceConfirm,
  isPending,
  onPopulate,
  onCancelForce,
}) => (
  <div className="flex justify-end gap-2">
    {showForceConfirm ? (
      <>
        <span className="self-center text-sm text-warning-700">
          {ANNUAL_REPORTS_MESSAGES.vatAutoPopulate.populateConfirmPrompt}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={onCancelForce}>
          {GLOBAL_UI_MESSAGES.actions.cancel}
        </Button>
        <Button type="button" variant="danger" size="sm" onClick={() => onPopulate(true)} isLoading={isPending}>
          {ANNUAL_REPORTS_MESSAGES.vatAutoPopulate.deleteAndRepopulate}
        </Button>
      </>
    ) : (
      <Button type="button" variant="ghost" size="sm" onClick={() => onPopulate(false)} isLoading={isPending}>
        {ANNUAL_REPORTS_MESSAGES.vatAutoPopulate.populateFromVat}
      </Button>
    )}
  </div>
)
