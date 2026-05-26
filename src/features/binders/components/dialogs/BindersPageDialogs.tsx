import { Input } from '@/components/ui/inputs/Input'
import { Modal } from '@/components/ui/overlays/Modal'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { Button } from '@/components/ui/primitives/Button'
import type { BinderResponse } from '../../types'
import { BinderHandoverPanel } from '../sections/BinderHandoverPanel'
import { Select } from '@/components/ui/inputs/Select'
import { NUMERIC_MONTH_OPTIONS, getOperationalYearOptions } from '@/constants/periodOptions.constants'

interface BindersPageDialogsProps {
  confirmReturnForId: number | null
  confirmDeleteForId: number | null
  pickupPersonName: string
  setPickupPersonName: (value: string) => void
  isReturning: boolean
  isDeleting: boolean
  onConfirmReturn: () => void
  onCancelReturn: () => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
  getBinderNumberLabel: (binderId: number | null) => string | null
  bulkReadyOpen: boolean
  onCloseBulkReady: () => void
  onConfirmBulkReady: () => void
  bulkReadyYear: number
  bulkReadyMonth: number
  setBulkReadyYear: (year: number) => void
  setBulkReadyMonth: (month: number) => void
  isMarkingReadyBulk: boolean
  dialogBinder: BinderResponse | null
  handoverOpen: boolean
  onCloseHandover: () => void
  onSubmitHandover: (payload: {
    binderIds: number[]
    receivedByName: string
    handedOverAt: string
    untilPeriodYear: number
    untilPeriodMonth: number
    notes: string | null
  }) => void
  isHandingOver: boolean
}

export const BindersPageDialogs: React.FC<BindersPageDialogsProps> = ({
  bulkReadyMonth,
  bulkReadyOpen,
  bulkReadyYear,
  confirmDeleteForId,
  confirmReturnForId,
  getBinderNumberLabel,
  handoverOpen,
  isDeleting,
  isHandingOver,
  isMarkingReadyBulk,
  isReturning,
  onCancelDelete,
  onCancelReturn,
  onCloseBulkReady,
  onCloseHandover,
  onConfirmBulkReady,
  onConfirmDelete,
  onConfirmReturn,
  onSubmitHandover,
  pickupPersonName,
  dialogBinder,
  setBulkReadyMonth,
  setBulkReadyYear,
  setPickupPersonName,
}) => (
  <>
    <ConfirmDialog
      open={confirmReturnForId !== null}
      title="החזרת קלסר"
      message={
        confirmReturnForId !== null
          ? `האם להחזיר את קלסר ${getBinderNumberLabel(confirmReturnForId)}?`
          : 'האם להחזיר את הקלסר?'
      }
      confirmLabel="החזר קלסר"
      cancelLabel="ביטול"
      isLoading={isReturning}
      onConfirm={onConfirmReturn}
      confirmDisabled={!pickupPersonName.trim()}
      onCancel={onCancelReturn}
    >
      <Input
        type="text"
        label="שם האיש המאסף"
        placeholder="שם חובה"
        value={pickupPersonName}
        onChange={(e) => setPickupPersonName(e.target.value)}
        className="mt-3"
        required
      />
    </ConfirmDialog>

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
      open={bulkReadyOpen}
      title="סימון עד תקופה כמוכן לאיסוף"
      onClose={onCloseBulkReady}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCloseBulkReady}>
            ביטול
          </Button>
          <Button type="button" isLoading={isMarkingReadyBulk} disabled={!dialogBinder} onClick={onConfirmBulkReady}>
            סמן כמוכן
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          הפעולה תסמן את כל הקלסרים של הלקוח עד תקופת הדיווח שנבחרה כמוכנים לאיסוף.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            label="עד שנת דיווח"
            value={String(bulkReadyYear)}
            onChange={(event) => setBulkReadyYear(Number(event.target.value))}
            options={getOperationalYearOptions()}
          />
          <Select
            label="עד חודש דיווח"
            value={String(bulkReadyMonth)}
            onChange={(event) => setBulkReadyMonth(Number(event.target.value))}
            options={NUMERIC_MONTH_OPTIONS}
          />
        </div>
      </div>
    </Modal>

    <Modal
      open={handoverOpen}
      title="מסירת קלסרים"
      onClose={onCloseHandover}
      footer={
        <div className="flex items-center justify-end">
          <Button type="button" variant="secondary" onClick={onCloseHandover}>
            סגור
          </Button>
        </div>
      }
    >
      {dialogBinder ? (
        <BinderHandoverPanel
          clientId={dialogBinder.client_record_id}
          initialBinderId={dialogBinder.id}
          isSubmitting={isHandingOver}
          onSubmit={onSubmitHandover}
        />
      ) : null}
    </Modal>
  </>
)

BindersPageDialogs.displayName = 'BindersPageDialogs'
