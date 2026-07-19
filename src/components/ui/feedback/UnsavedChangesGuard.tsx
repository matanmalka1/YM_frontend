import { OverlayContainer } from '../layout/OverlayContainer'
import { Button } from '../primitives/Button'

interface UnsavedChangesGuardProps {
  onContinue: () => void
  onDiscard: () => void
}

export const UnsavedChangesGuard: React.FC<UnsavedChangesGuardProps> = ({ onContinue, onDiscard }) => (
  <OverlayContainer open variant="dialog">
    <h3 className="mb-2 text-base font-semibold text-gray-900">לבטל שינויים?</h3>
    <p className="mb-4 text-sm text-gray-600">יש שינויים שלא נשמרו. האם לסגור בכל זאת?</p>
    <div className="flex items-center justify-end gap-2">
      <Button type="button" variant="outline" size="sm" onClick={onContinue}>
        המשך עריכה
      </Button>
      <Button type="button" variant="danger" size="sm" onClick={onDiscard}>
        סגור בלי לשמור
      </Button>
    </div>
  </OverlayContainer>
)

UnsavedChangesGuard.displayName = 'UnsavedChangesGuard'
