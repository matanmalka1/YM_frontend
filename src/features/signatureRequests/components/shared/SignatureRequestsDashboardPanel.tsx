import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, FileSignature, Plus } from 'lucide-react'
import { ActionSurfaceButton } from '@/components/ui/primitives/ActionSurface'
import { Button } from '@/components/ui/primitives/Button'
import { Card } from '@/components/ui/primitives/Card'
import { InlineState } from '@/components/ui/feedback'
import { StatusBadge } from '@/components/ui/primitives/StatusBadge'
import { Badge } from '@/components/ui/primitives/Badge'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { DataTable } from '@/components/ui/table/DataTable'
import { getSignatureRequestStatusLabel, getSignatureRequestTypeLabel } from '@/features/signatureRequests'
import { cn, formatClientOfficeId, formatDate, showErrorToast } from '@/utils/utils'
import type { SignatureRequestResponse } from '../../api'
import { usePendingSignatureRequests } from '../../hooks/usePendingSignatureRequests'
import { useSignatureRequestActions } from '../../hooks/useSignatureRequestActions'
import { signatureRequestStatusVariants, useSignatureRequestSigningUrls } from '../../utils'
import { CreateSignatureRequestModal } from '../form/CreateSignatureRequestModal'
import { SignatureRequestAuditDrawer } from '../drawer/SignatureRequestAuditDrawer'
import { SignatureRequestRowActions } from '../list/SignatureRequestRowActions'
import { SIGNATURE_REQUESTS_MESSAGES } from '../../messages'
import { SIGNATURE_REQUESTS_ERROR_MESSAGES } from '../../errorMessages'

interface Props {
  compact?: boolean
}

export const SignatureRequestsDashboardPanel: React.FC<Props> = ({ compact = false }) => {
  const { items, total, businessLookup, isLoading, error } = usePendingSignatureRequests()
  const { create, isCreating, cancel, isCanceling } = useSignatureRequestActions()
  const [auditRequestId, setAuditRequestId] = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<SignatureRequestResponse | null>(null)
  const { signingUrls, rememberSigningUrl } = useSignatureRequestSigningUrls()

  const tableItems = compact ? items.slice(0, 3) : items

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return
    try {
      await cancel(cancelTarget.client_record_id, cancelTarget.id)
      setCancelTarget(null)
    } catch (err) {
      showErrorToast(err, SIGNATURE_REQUESTS_ERROR_MESSAGES.cancel.request)
    }
  }

  const columns = useMemo(
    () => [
      {
        key: 'office_client_number',
        header: SIGNATURE_REQUESTS_MESSAGES.dashboard.clientOfficeNumber,
        render: (req: SignatureRequestResponse) => (
          <span className="font-mono text-sm text-gray-500 tabular-nums">
            {formatClientOfficeId(req.office_client_number)}
          </span>
        ),
      },
      {
        key: 'title',
        header: SIGNATURE_REQUESTS_MESSAGES.dashboard.request,
        render: (req: SignatureRequestResponse) => (
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">{req.title}</p>
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {getSignatureRequestTypeLabel(req.request_type)} · {req.signer_name}
            </p>
          </div>
        ),
      },
      {
        key: 'client',
        header: SIGNATURE_REQUESTS_MESSAGES.dashboard.client,
        render: (req: SignatureRequestResponse) => {
          const entry = req.business_id != null ? businessLookup[req.business_id] : undefined
          const name =
            entry?.name ??
            req.business_name ??
            SIGNATURE_REQUESTS_MESSAGES.dashboard.clientReference(req.client_record_id)
          return (
            <Link
              to={`/clients/${req.client_record_id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-gray-700 hover:text-primary-600 hover:underline"
            >
              {name}
            </Link>
          )
        },
      },
      {
        key: 'status',
        header: SIGNATURE_REQUESTS_MESSAGES.fields.status,
        render: (req: SignatureRequestResponse) => (
          <StatusBadge
            status={req.status}
            getLabel={getSignatureRequestStatusLabel}
            variantMap={signatureRequestStatusVariants}
          />
        ),
      },
      {
        key: 'created_at',
        header: SIGNATURE_REQUESTS_MESSAGES.fields.createdAt,
        render: (req: SignatureRequestResponse) => (
          <span className="tabular-nums text-gray-500">{formatDate(req.created_at)}</span>
        ),
      },
      {
        key: 'actions',
        header: '',
        headerClassName: 'w-10',
        className: 'w-10',
        render: (req: SignatureRequestResponse) => (
          <SignatureRequestRowActions
            request={req}
            signingUrl={signingUrls[req.id]}
            isCanceling={isCanceling}
            canManage
            onCancelRequest={() => setCancelTarget(req)}
            onAudit={setAuditRequestId}
            showOpenLink
            copySuccessMessage={null}
          />
        ),
      },
    ],
    [businessLookup, isCanceling, signingUrls],
  )

  return (
    <Card size="compact" disablePadding className="shadow-sm">
      <div className={cn('border-b border-gray-100', compact ? 'px-5 py-4' : 'px-5 py-4')}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <FileSignature className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <h2 className={cn('truncate font-bold text-gray-900', compact ? 'text-base' : 'text-sm')}>
                {SIGNATURE_REQUESTS_MESSAGES.dashboard.title}
              </h2>
              {!compact && (
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {error ?? SIGNATURE_REQUESTS_MESSAGES.dashboard.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="neutral" size="md" className="min-w-8 justify-center tabular-nums">
              {total}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-3.5 w-3.5" />
              {SIGNATURE_REQUESTS_MESSAGES.actions.newRequest}
            </Button>
          </div>
        </div>
      </div>

      <div className={cn('space-y-4', compact ? 'p-5' : 'p-4')}>
        {error ? (
          <InlineState
            variant="error"
            icon={AlertCircle}
            title={SIGNATURE_REQUESTS_ERROR_MESSAGES.dashboard.load}
            description={error}
          />
        ) : compact ? (
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
            {tableItems.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm font-semibold text-gray-500">
                {SIGNATURE_REQUESTS_MESSAGES.dashboard.noActiveRequests}
              </div>
            ) : (
              tableItems.map((req) => (
                <ActionSurfaceButton key={req.id} variant="plainRow" onClick={() => setAuditRequestId(req.id)}>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-gray-900">{req.title}</p>
                    <p className="mt-0.5 truncate text-2xs text-gray-500">
                      {req.business_name ??
                        (req.office_client_number != null
                          ? formatClientOfficeId(req.office_client_number)
                          : SIGNATURE_REQUESTS_MESSAGES.dashboard.clientReference(req.client_record_id))}{' '}
                      · {formatDate(req.created_at)}
                    </p>
                  </div>
                  <StatusBadge
                    status={req.status}
                    getLabel={getSignatureRequestStatusLabel}
                    variantMap={signatureRequestStatusVariants}
                  />
                </ActionSurfaceButton>
              ))
            )}
          </div>
        ) : (
          <DataTable
            data={tableItems}
            columns={columns}
            getRowKey={(req) => req.id}
            onRowClick={(req) => setAuditRequestId(req.id)}
            isLoading={isLoading}
            emptyState={{
              icon: FileSignature,
              title: SIGNATURE_REQUESTS_MESSAGES.dashboard.noRequests,
              message: SIGNATURE_REQUESTS_MESSAGES.dashboard.noActiveRequests,
            }}
          />
        )}
      </div>

      <SignatureRequestAuditDrawer requestId={auditRequestId} onClose={() => setAuditRequestId(null)} />
      <CreateSignatureRequestModal
        open={showCreate}
        isLoading={isCreating}
        onClose={() => setShowCreate(false)}
        onCreate={async (payload) => {
          const result = await create(payload)
          rememberSigningUrl(result)
        }}
      />

      <ConfirmDialog
        open={cancelTarget !== null}
        title={SIGNATURE_REQUESTS_MESSAGES.cancel.title}
        message={SIGNATURE_REQUESTS_MESSAGES.cancel.message}
        confirmLabel={SIGNATURE_REQUESTS_MESSAGES.actions.cancelRequest}
        cancelLabel={SIGNATURE_REQUESTS_MESSAGES.actions.back}
        isLoading={isCanceling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </Card>
  )
}

SignatureRequestsDashboardPanel.displayName = 'SignatureRequestsDashboardPanel'
