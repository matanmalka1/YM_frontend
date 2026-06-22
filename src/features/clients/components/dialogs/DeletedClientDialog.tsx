import { AlertTriangle } from 'lucide-react'
import { Modal } from '../../../../components/ui/overlays/Modal'
import { Button } from '../../../../components/ui/primitives/Button'
import { formatDate } from '../../../../utils/utils'
import type { DeletedClientSummary } from '../../api'

interface Props {
  open: boolean
  deletedClient: DeletedClientSummary | null
  isAdvisor: boolean
  onRestore: () => void
  onForceCreate: () => void
  onDismiss: () => void
  restoreLoading?: boolean
  forceCreateLoading?: boolean
}

export const DeletedClientDialog: React.FC<Props> = ({
  open,
  deletedClient,
  isAdvisor,
  onRestore,
  onForceCreate,
  onDismiss,
  restoreLoading = false,
  forceCreateLoading = false,
}) => {
  const isLoading = restoreLoading || forceCreateLoading

  if (!deletedClient) return null
  return (
    <Modal
      open={open}
      onClose={onDismiss}
      title="נמצאה רשומה קודמת"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onDismiss} disabled={isLoading}>
            ביטול
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onForceCreate}
            isLoading={forceCreateLoading}
            disabled={isLoading}
          >
            צור לקוח חדש
          </Button>
          {isAdvisor && (
            <Button type="button" variant="primary" onClick={onRestore} isLoading={restoreLoading} disabled={isLoading}>
              שחזר לקוח
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-warning-200 bg-warning-50 p-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning-500" />
          <p className="text-sm text-warning-800">לקוח עם מספר זהות זה קיים במערכת אך נמחק. בחר כיצד להמשיך.</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">שם</span>
            <span className="font-medium text-gray-900">{deletedClient.full_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">נמחק בתאריך</span>
            <span className="font-medium text-gray-900">{formatDate(deletedClient.deleted_at)}</span>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium">שחזר לקוח</span> — מחזיר את הרשומה הישנה עם כל ההיסטוריה (מסמכים, דוחות,
            חיובים).
          </p>
          <p>
            <span className="font-medium">צור לקוח חדש</span> — יוצר רשומה חדשה נקייה, הרשומה הישנה תישאר מחוקה.
          </p>
          {!isAdvisor && <p className="text-warning-700">שחזור לקוח זמין ליועצים בלבד. פנה ליועץ לביצוע שחזור.</p>}
        </div>
      </div>
    </Modal>
  )
}
