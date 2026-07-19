import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Snowflake, Trash2, Undo2 } from 'lucide-react'
import { Button } from '../../../../components/ui/primitives/Button'
import { Card } from '../../../../components/ui/primitives/Card'
import { StatusBadge } from '../../../../components/ui/primitives/StatusBadge'
import { RowActionItem, RowActionsMenu } from '@/components/ui/table'
import { ConfirmDialog } from '../../../../components/ui/overlays/ConfirmDialog'
import { Modal } from '../../../../components/ui/overlays/Modal'
import { ModalFormActions } from '../../../../components/ui/overlays/ModalFormActions'
import { Input } from '../../../../components/ui/inputs/Input'
import { Select } from '../../../../components/ui/inputs/Select'
import type { BusinessResponse, UpdateBusinessPayload } from '../../api'
import { BUSINESS_STATUS_BADGE_VARIANTS, BUSINESS_STATUS_OPTIONS, getBusinessStatusLabel } from '@/features/businesses'
import { CLIENT_ROUTES } from '../../api/endpoints'
import { formatDate } from '@/utils/utils'
import { useBusinessActions } from '../../hooks/useBusinessActions'
import { useBusinessesForClient } from '@/hooks/useBusinessesForClient'
import { CLIENTS_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

const todayIsoDate = () => new Date().toISOString().slice(0, 10)

interface Props {
  clientId: number
  canEdit: boolean
  onAddBusiness: () => void
}

interface EditState {
  business: BusinessResponse
  name: string
  status: BusinessResponse['status']
  closedAt: string
}

export const ClientBusinessesCard: React.FC<Props> = ({ clientId, canEdit, onAddBusiness }) => {
  const { businesses, isLoading } = useBusinessesForClient({
    clientId,
    enabled: clientId > 0,
  })

  const { updateBusiness, isUpdating, deleteBusiness, isDeleting } = useBusinessActions(clientId)

  const [editState, setEditState] = useState<EditState | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BusinessResponse | null>(null)

  const openEdit = (biz: BusinessResponse) =>
    setEditState({
      business: biz,
      name: biz.business_name ?? '',
      status: biz.status,
      closedAt: biz.closed_at ?? '',
    })

  const submitEdit = async () => {
    if (!editState) return
    const payload: UpdateBusinessPayload = {
      business_name: editState.name || null,
      status: editState.status,
      closed_at: editState.status === 'closed' ? editState.closedAt || null : null,
    }
    await updateBusiness(editState.business.id, payload)
    setEditState(null)
  }

  const updateBusinessStatus = (businessId: number, status: BusinessResponse['status'], closedAt?: string) =>
    updateBusiness(businessId, {
      status,
      closed_at: status === 'closed' ? (closedAt ?? todayIsoDate()) : null,
    })

  return (
    <>
      <Card
        title={CLIENTS_MESSAGES.businessesCard.title}
        size="compact"
        className="shadow-none"
        actions={
          canEdit ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              iconPosition="end"
              onClick={onAddBusiness}
            >
              {CLIENTS_MESSAGES.businessesCard.addBusiness}
            </Button>
          ) : undefined
        }
      >
        {isLoading ? (
          <p className="px-1 py-4 text-sm text-gray-500">{GLOBAL_UI_MESSAGES.common.loading}</p>
        ) : businesses.length === 0 ? (
          <p className="px-1 py-4 text-sm text-gray-500">{CLIENTS_MESSAGES.businessesCard.empty}</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {businesses.map((biz) => (
              <li key={biz.id} className="flex items-center gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <Link
                    to={CLIENT_ROUTES.businessDetail(clientId, biz.id)}
                    className="flex min-w-0 items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {biz.business_name ?? CLIENTS_MESSAGES.businessesCard.notDefined}
                      </p>
                      <p className="mt-1 text-xs font-medium text-gray-500">
                        {CLIENTS_MESSAGES.businessesCard.openedAt(formatDate(biz.opened_at))}
                      </p>
                    </div>
                    <StatusBadge
                      status={biz.status}
                      getLabel={getBusinessStatusLabel}
                      variantMap={BUSINESS_STATUS_BADGE_VARIANTS}
                    />
                  </Link>
                </div>

                {canEdit && (
                  <RowActionsMenu
                    ariaLabel={CLIENTS_MESSAGES.businessesCard.rowActionsAriaLabel(biz.business_name ?? biz.id)}
                  >
                    <RowActionItem
                      label={GLOBAL_UI_MESSAGES.actions.edit}
                      icon={<Pencil className="h-4 w-4" />}
                      onClick={() => openEdit(biz)}
                    />
                    {biz.status !== 'active' && (
                      <RowActionItem
                        label={CLIENTS_MESSAGES.businessesCard.activate}
                        icon={<Undo2 className="h-4 w-4" />}
                        onClick={() => void updateBusinessStatus(biz.id, 'active')}
                      />
                    )}
                    {biz.status !== 'frozen' && (
                      <RowActionItem
                        label={CLIENTS_MESSAGES.businessesCard.freeze}
                        icon={<Snowflake className="h-4 w-4" />}
                        onClick={() => void updateBusinessStatus(biz.id, 'frozen')}
                      />
                    )}
                    {biz.status !== 'closed' && (
                      <RowActionItem
                        label={CLIENTS_MESSAGES.businessesCard.closeBusiness}
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => void updateBusinessStatus(biz.id, 'closed')}
                      />
                    )}
                    <RowActionItem
                      label={GLOBAL_UI_MESSAGES.actions.delete}
                      icon={<Trash2 className="h-4 w-4" />}
                      danger
                      onClick={() => setDeleteTarget(biz)}
                    />
                  </RowActionsMenu>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={!!editState}
        title={CLIENTS_MESSAGES.businessesCard.editModalTitle}
        onClose={() => setEditState(null)}
        footer={
          <ModalFormActions
            onCancel={() => setEditState(null)}
            onSubmit={submitEdit}
            isLoading={isUpdating}
            submitLabel={GLOBAL_UI_MESSAGES.actions.save}
          />
        }
      >
        {editState && (
          <div className="space-y-4">
            <Input
              label={CLIENTS_MESSAGES.businessesCard.nameLabel}
              value={editState.name}
              onChange={(e) => setEditState((s) => s && { ...s, name: e.target.value })}
              disabled={isUpdating}
            />
            <Select
              label={GLOBAL_UI_MESSAGES.common.status}
              options={BUSINESS_STATUS_OPTIONS}
              value={editState.status}
              onChange={(e) =>
                setEditState((s) =>
                  s
                    ? {
                        ...s,
                        status: e.target.value as BusinessResponse['status'],
                        closedAt: e.target.value === 'closed' ? s.closedAt || todayIsoDate() : '',
                      }
                    : s,
                )
              }
              disabled={isUpdating}
            />
            {editState.status === 'closed' && (
              <Input
                label={CLIENTS_MESSAGES.businessesCard.closeDateLabel}
                type="date"
                value={editState.closedAt}
                onChange={(e) => setEditState((s) => s && { ...s, closedAt: e.target.value })}
                disabled={isUpdating}
              />
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={CLIENTS_MESSAGES.businessesCard.deleteModalTitle}
        message={CLIENTS_MESSAGES.businessesCard.deleteMessage(deleteTarget?.business_name ?? '')}
        confirmLabel={GLOBAL_UI_MESSAGES.actions.delete}
        cancelLabel={GLOBAL_UI_MESSAGES.actions.cancel}
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={() => {
          if (deleteTarget) deleteBusiness(deleteTarget.id)
          setDeleteTarget(null)
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
