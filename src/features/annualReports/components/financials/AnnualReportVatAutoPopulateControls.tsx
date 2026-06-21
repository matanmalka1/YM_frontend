import { Button } from '../../../../components/ui/primitives/Button'

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
        <span className="self-center text-sm text-warning-700">קיימות שורות — למחוק ולמלא מחדש?</span>
        <Button type="button" variant="outline" size="sm" onClick={onCancelForce}>
          ביטול
        </Button>
        <Button type="button" variant="danger" size="sm" onClick={() => onPopulate(true)} isLoading={isPending}>
          מחק ומלא מחדש
        </Button>
      </>
    ) : (
      <Button type="button" variant="ghost" size="sm" onClick={() => onPopulate(false)} isLoading={isPending}>
        מלא מנתוני מע"מ
      </Button>
    )}
  </div>
)
