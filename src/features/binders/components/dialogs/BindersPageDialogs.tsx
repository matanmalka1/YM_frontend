import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { Modal } from '@/components/ui/overlays/Modal'
import { Button } from '@/components/ui/primitives/Button'
import { NUMERIC_MONTH_OPTIONS, getOperationalYearOptions } from '@/constants/periodOptions.constants'
import type { BinderResponse } from '../../types'
import { BinderHandoverPanel } from '../sections/BinderHandoverPanel'

interface BindersPageDialogsProps {
  confirmHandoverForId: number | null
  confirmDeleteForId: number | null
  confirmReadyForHandoverForId: number | null
  handoverRecipientName: string
  setHandoverRecipientName: (value: string) => void
  isHandingOverToClient: boolean
  isDeleting: boolean
  isMarkingReadyForHandover: boolean
  onConfirmHandoverToClient: () => void
  onCancelHandoverToClient: () => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
  onConfirmReadyForHandover: () => void
  onCancelReadyForHandover: () => void
  getBinderNumberLabel: (binderId: number | null) => string | null
  bulkReadyForHandoverOpen: boolean
  onCloseBulkReadyForHandover: () => void
  onConfirmBulkReadyForHandover: () => void
  bulkReadyForHandoverYear: number
  bulkReadyForHandoverMonth: number
  setBulkReadyForHandoverYear: (year: number) => void
  setBulkReadyForHandoverMonth: (month: number) => void
  isMarkingReadyForHandoverBulk: boolean
  dialogBinder: BinderResponse | null
  handoverToClientBulkOpen: boolean
  onCloseHandoverToClientBulk: () => void
  onSubmitHandoverToClientBulk: (payload: {
    binderIds: number[]
    receivedByName: string
    handedOverAt: string
    untilPeriodYear: number
    untilPeriodMonth: number
    notes: string | null
  }) => void
  isHandingOverToClientBulk: boolean
}

export const BindersPageDialogs: React.FC<BindersPageDialogsProps> = ({
  bulkReadyForHandoverMonth,
  bulkReadyForHandoverOpen,
  bulkReadyForHandoverYear,
  confirmDeleteForId,
  confirmHandoverForId,
  confirmReadyForHandoverForId,
  dialogBinder,
  getBinderNumberLabel,
  handoverRecipientName,
  handoverToClientBulkOpen,
  isDeleting,
  isHandingOverToClient,
  isHandingOverToClientBulk,
  isMarkingReadyForHandover,
  isMarkingReadyForHandoverBulk,
  onCancelDelete,
  onCancelHandoverToClient,
  onCancelReadyForHandover,
  onCloseBulkReadyForHandover,
  onCloseHandoverToClientBulk,
  onConfirmBulkReadyForHandover,
  onConfirmDelete,
  onConfirmHandoverToClient,
  onConfirmReadyForHandover,
  onSubmitHandoverToClientBulk,
  setBulkReadyForHandoverMonth,
  setBulkReadyForHandoverYear,
  setHandoverRecipientName,
}) => (
  <>
    <ConfirmDialog
      open={confirmHandoverForId !== null}
      title="מסירת קלסר"
      message={
        confirmHandoverForId !== null
          ? `האם למסור את קלסר ${getBinderNumberLabel(confirmHandoverForId)} ללקוח?`
          : 'האם למסור את הקלסר ללקוח?'
      }
      confirmLabel="מסור קלסר"
      cancelLabel="ביטול"
      isLoading={isHandingOverToClient}
      onConfirm={onConfirmHandoverToClient}
      confirmDisabled={!handoverRecipientName.trim()}
      onCancel={onCancelHandoverToClient}
    >
      <Input
        type="text"
        label="נמסר לידי"
        placeholder="שם חובה"
        value={handoverRecipientName}
        onChange={(e) => setHandoverRecipientName(e.target.value)}
        className="mt-3"
        required
      />
    </ConfirmDialog>

    <ConfirmDialog
      open={confirmReadyForHandoverForId !== null}
      title="סימון כמוכן למסירה"
      message={`האם לסמן את קלסר ${getBinderNumberLabel(confirmReadyForHandoverForId)} כמוכן למסירה?`}
      confirmLabel="סמן כמוכן למסירה"
      cancelLabel="ביטול"
      isLoading={isMarkingReadyForHandover}
      onConfirm={onConfirmReadyForHandover}
      onCancel={onCancelReadyForHandover}
    />

    <ConfirmDialog
      open={confirmDeleteForId !== null}
      title="מחיקת קלסר"
      message={`האם למחוק את קלסר ${getBinderNumberLabel(confirmDeleteForId)}? פעולה זו אינה ניתנת לביטול.`}
      confirmLabel="מחק קלסר"
      cancelLabel="ביטול"
      confirmVariant="danger"
      isLoading={isDeleting}
      onConfirm={onConfirmDelete}
      onCancel={onCancelDelete}
    />

    <Modal
      open={bulkReadyForHandoverOpen}
      title="סימון קבוצתי כמוכן למסירה"
      onClose={onCloseBulkReadyForHandover}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCloseBulkReadyForHandover}>
            ביטול
          </Button>
          <Button
            type="button"
            isLoading={isMarkingReadyForHandoverBulk}
            disabled={!dialogBinder}
            onClick={onConfirmBulkReadyForHandover}
          >
            סמן כמוכן למסירה
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          הפעולה תסמן את כל הקלסרים של הלקוח עד תקופת הדיווח שנבחרה כמוכנים למסירה.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            label="עד שנת דיווח"
            value={String(bulkReadyForHandoverYear)}
            onChange={(event) => setBulkReadyForHandoverYear(Number(event.target.value))}
            options={getOperationalYearOptions()}
          />
          <Select
            label="עד חודש דיווח"
            value={String(bulkReadyForHandoverMonth)}
            onChange={(event) => setBulkReadyForHandoverMonth(Number(event.target.value))}
            options={NUMERIC_MONTH_OPTIONS}
          />
        </div>
      </div>
    </Modal>

    <Modal
      open={handoverToClientBulkOpen}
      title="מסירת קלסרים ללקוח"
      onClose={onCloseHandoverToClientBulk}
      footer={
        <div className="flex items-center justify-end">
          <Button type="button" variant="secondary" onClick={onCloseHandoverToClientBulk}>
            סגור
          </Button>
        </div>
      }
    >
      {dialogBinder ? (
        <BinderHandoverPanel
          clientId={dialogBinder.client_record_id}
          initialBinderId={dialogBinder.id}
          isSubmitting={isHandingOverToClientBulk}
          onSubmit={onSubmitHandoverToClientBulk}
        />
      ) : null}
    </Modal>
  </>
)

BindersPageDialogs.displayName = 'BindersPageDialogs'
