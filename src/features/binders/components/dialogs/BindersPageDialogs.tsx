import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { Modal } from '@/components/ui/overlays/Modal'
import { Button } from '@/components/ui/primitives/Button'
import { NUMERIC_MONTH_OPTIONS, getOperationalYearOptions } from '@/constants/periodOptions.constants'
import type { BinderResponse } from '../../types'
import { BinderHandoverPanel } from './BinderHandoverPanel'
import { BINDERS_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

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
      title={BINDERS_MESSAGES.dialogs.handoverTitle}
      message={
        confirmHandoverForId !== null
          ? BINDERS_MESSAGES.dialogs.handoverMessage(getBinderNumberLabel(confirmHandoverForId))
          : BINDERS_MESSAGES.dialogs.handoverFallbackMessage
      }
      confirmLabel={BINDERS_MESSAGES.dialogs.handoverConfirm}
      cancelLabel={GLOBAL_UI_MESSAGES.actions.cancel}
      isLoading={isHandingOverToClient}
      onConfirm={onConfirmHandoverToClient}
      confirmDisabled={!handoverRecipientName.trim()}
      onCancel={onCancelHandoverToClient}
    >
      <Input
        type="text"
        label={BINDERS_MESSAGES.handover.recipientLabel}
        placeholder={BINDERS_MESSAGES.dialogs.recipientRequiredPlaceholder}
        value={handoverRecipientName}
        onChange={(e) => setHandoverRecipientName(e.target.value)}
        className="mt-3"
        required
      />
    </ConfirmDialog>

    <ConfirmDialog
      open={confirmReadyForHandoverForId !== null}
      title={BINDERS_MESSAGES.dialogs.readyTitle}
      message={BINDERS_MESSAGES.dialogs.readyMessage(getBinderNumberLabel(confirmReadyForHandoverForId))}
      confirmLabel={BINDERS_MESSAGES.actions.markReadyForHandover}
      cancelLabel={GLOBAL_UI_MESSAGES.actions.cancel}
      isLoading={isMarkingReadyForHandover}
      onConfirm={onConfirmReadyForHandover}
      onCancel={onCancelReadyForHandover}
    />

    <ConfirmDialog
      open={confirmDeleteForId !== null}
      title={BINDERS_MESSAGES.dialogs.deleteTitle}
      message={BINDERS_MESSAGES.dialogs.deleteMessage(getBinderNumberLabel(confirmDeleteForId))}
      confirmLabel={BINDERS_MESSAGES.actions.deleteBinder}
      cancelLabel={GLOBAL_UI_MESSAGES.actions.cancel}
      confirmVariant="danger"
      isLoading={isDeleting}
      onConfirm={onConfirmDelete}
      onCancel={onCancelDelete}
    />

    <Modal
      open={bulkReadyForHandoverOpen}
      title={BINDERS_MESSAGES.dialogs.bulkReadyTitle}
      onClose={onCloseBulkReadyForHandover}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCloseBulkReadyForHandover}>
            {GLOBAL_UI_MESSAGES.actions.cancel}
          </Button>
          <Button
            type="button"
            isLoading={isMarkingReadyForHandoverBulk}
            disabled={!dialogBinder}
            onClick={onConfirmBulkReadyForHandover}
          >
            {BINDERS_MESSAGES.actions.markReadyForHandover}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-700">{BINDERS_MESSAGES.dialogs.bulkReadyDescription}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            label={BINDERS_MESSAGES.handover.untilYear}
            value={String(bulkReadyForHandoverYear)}
            onChange={(event) => setBulkReadyForHandoverYear(Number(event.target.value))}
            options={getOperationalYearOptions()}
          />
          <Select
            label={BINDERS_MESSAGES.handover.untilMonth}
            value={String(bulkReadyForHandoverMonth)}
            onChange={(event) => setBulkReadyForHandoverMonth(Number(event.target.value))}
            options={NUMERIC_MONTH_OPTIONS}
          />
        </div>
      </div>
    </Modal>

    <Modal
      open={handoverToClientBulkOpen}
      title={BINDERS_MESSAGES.dialogs.bulkHandoverTitle}
      onClose={onCloseHandoverToClientBulk}
      footer={
        <div className="flex items-center justify-end">
          <Button type="button" variant="secondary" onClick={onCloseHandoverToClientBulk}>
            {GLOBAL_UI_MESSAGES.actions.close}
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
