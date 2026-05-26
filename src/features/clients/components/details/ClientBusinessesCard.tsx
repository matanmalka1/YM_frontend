import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { clientsApi, clientsQK } from '../../api'
import type { BusinessResponse, UpdateBusinessPayload } from '../../api'
import { BUSINESS_STATUS_LABELS } from '@/features/businesses'
import { CLIENT_ROUTES } from '../../api/endpoints'
import { formatDate } from '@/utils/utils'
import { useBusinessActions } from '../../hooks/useBusinessActions'

const BUSINESS_STATUS_VARIANTS: Record<BusinessResponse['status'], 'success' | 'warning' | 'neutral'> = {
  active: 'success',
  frozen: 'warning',
  closed: 'neutral',
}

const BUSINESS_STATUS_OPTIONS = [
  { value: 'active', label: BUSINESS_STATUS_LABELS.active },
  { value: 'frozen', label: BUSINESS_STATUS_LABELS.frozen },
  { value: 'closed', label: BUSINESS_STATUS_LABELS.closed },
]

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
  const { data, isLoading } = useQuery({
    queryKey: clientsQK.businessesAll(clientId),
    queryFn: () => clientsApi.listAllBusinessesForClient(clientId),
    enabled: clientId > 0,
  })

  const { updateBusiness, isUpdating, deleteBusiness, isDeleting } = useBusinessActions(clientId)

  const [editState, setEditState] = useState<EditState | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BusinessResponse | null>(null)

  const businesses = data?.items ?? []

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
      closed_at: status === 'closed' ? (closedAt ?? new Date().toISOString().slice(0, 10)) : null,
    })

  return (
    <>
      <Card
        title="עסקים"
        size="compact"
        className="shadow-none"
        actions={
          canEdit ? (
            <Button type="button" variant="ghost" size="sm" onClick={onAddBusiness} className="gap-2">
              <Plus className="h-4 w-4" />
              הוסף עסק
            </Button>
          ) : undefined
        }
      >
        {isLoading ? (
          <p className="px-1 py-4 text-sm text-gray-500">טוען...</p>
        ) : businesses.length === 0 ? (
          <p className="px-1 py-4 text-sm text-gray-500">אין עסקים רשומים</p>
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
                      <p className="truncate text-sm font-medium text-gray-900">{biz.business_name ?? 'לא הוגדר'}</p>
                      <p className="mt-1 text-xs font-medium text-gray-500">נפתח בתאריך {formatDate(biz.opened_at)}</p>
                    </div>
                    <StatusBadge
                      status={biz.status}
                      getLabel={(s) => BUSINESS_STATUS_LABELS[s as keyof typeof BUSINESS_STATUS_LABELS] ?? s}
                      variantMap={BUSINESS_STATUS_VARIANTS}
                    />
                  </Link>
                </div>

                {canEdit && (
                  <RowActionsMenu ariaLabel={`פעולות לעסק ${biz.business_name ?? biz.id}`}>
                    <RowActionItem label="עריכה" icon={<Pencil className="h-4 w-4" />} onClick={() => openEdit(biz)} />
                    {biz.status !== 'active' && (
                      <RowActionItem
                        label="העבר לפעיל"
                        icon={<Undo2 className="h-4 w-4" />}
                        onClick={() => void updateBusinessStatus(biz.id, 'active')}
                      />
                    )}
                    {biz.status !== 'frozen' && (
                      <RowActionItem
                        label="הקפא עסק"
                        icon={<Snowflake className="h-4 w-4" />}
                        onClick={() => void updateBusinessStatus(biz.id, 'frozen')}
                      />
                    )}
                    {biz.status !== 'closed' && (
                      <RowActionItem
                        label="סגור עסק"
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => void updateBusinessStatus(biz.id, 'closed')}
                      />
                    )}
                    <RowActionItem
                      label="מחק"
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
        title="עריכת עסק"
        onClose={() => setEditState(null)}
        footer={
          <ModalFormActions
            onCancel={() => setEditState(null)}
            onSubmit={submitEdit}
            isLoading={isUpdating}
            submitLabel="שמור"
          />
        }
      >
        {editState && (
          <div className="space-y-4">
            <Input
              label="שם עסק"
              value={editState.name}
              onChange={(e) => setEditState((s) => s && { ...s, name: e.target.value })}
              disabled={isUpdating}
            />
            <Select
              label="סטטוס"
              options={BUSINESS_STATUS_OPTIONS}
              value={editState.status}
              onChange={(e) =>
                setEditState((s) =>
                  s
                    ? {
                        ...s,
                        status: e.target.value as BusinessResponse['status'],
                        closedAt:
                          e.target.value === 'closed' ? s.closedAt || new Date().toISOString().slice(0, 10) : '',
                      }
                    : s,
                )
              }
              disabled={isUpdating}
            />
            {editState.status === 'closed' && (
              <Input
                label="תאריך סגירה"
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
        title="מחיקת עסק"
        message={`האם למחוק את העסק "${deleteTarget?.business_name ?? ''}"? פעולה זו אינה ניתנת לביטול.`}
        confirmLabel="מחק"
        cancelLabel="ביטול"
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
