import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, FileSignature, Plus } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { StatusBadge } from '@/components/ui/primitives/StatusBadge'
import { DataTable } from '@/components/ui/table/DataTable'
import { getSignatureRequestStatusLabel, getSignatureRequestTypeLabel } from '@/utils/enums'
import { cn, formatClientOfficeId, formatDate } from '@/utils/utils'
import type { SignatureRequestResponse } from '../api'
import { usePendingSignatureRequests } from '../hooks/usePendingSignatureRequests'
import { useSignatureRequestActions } from '../hooks/useSignatureRequestActions'
import { signatureRequestStatusVariants, useSignatureRequestSigningUrls } from '../utils'
import { CreateSignatureRequestModal } from './CreateSignatureRequestModal'
import { SignatureRequestAuditDrawer } from './SignatureRequestAuditDrawer'
import { SignatureRequestRowActions } from './SignatureRequestRowActions'

interface Props {
  compact?: boolean
}

export const SignatureRequestsDashboardPanel: React.FC<Props> = ({ compact = false }) => {
  const { items, total, businessLookup, isLoading, error } = usePendingSignatureRequests()
  const { create, isCreating, cancel, isCanceling } = useSignatureRequestActions()
  const [auditRequestId, setAuditRequestId] = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const { signingUrls, rememberSigningUrl } = useSignatureRequestSigningUrls()

  const tableItems = compact ? items.slice(0, 3) : items

  const columns = useMemo(
    () => [
      {
        key: 'office_client_number',
        header: "מס' לקוח",
        render: (req: SignatureRequestResponse) => (
          <span className="font-mono text-sm text-gray-500 tabular-nums">
            {formatClientOfficeId(req.office_client_number)}
          </span>
        ),
      },
      {
        key: 'title',
        header: 'בקשה',
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
        header: 'לקוח',
        render: (req: SignatureRequestResponse) => {
          const entry = req.business_id != null ? businessLookup[req.business_id] : undefined
          const name = entry?.name ?? req.business_name ?? `לקוח #${req.client_record_id}`
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
        header: 'סטטוס',
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
        header: 'נוצר',
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
            onCancel={async (id) => void cancel(id)}
            onAudit={setAuditRequestId}
            showOpenLink
            separateHistory
            copySuccessMessage={null}
          />
        ),
      },
    ],
    [businessLookup, cancel, isCanceling, signingUrls],
  )

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className={cn('border-b border-gray-100', compact ? 'px-5 py-4' : 'px-5 py-4')}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <FileSignature className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <h2 className={cn('truncate font-bold text-gray-900', compact ? 'text-base' : 'text-sm')}>בקשות חתימה</h2>
              {!compact && (
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {error ?? 'ניהול בקשות חתימה פעילות מכל הלקוחות'}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-slate-100 px-2.5 text-sm font-bold tabular-nums text-slate-700">
              {total}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-3.5 w-3.5" />
              בקשה חדשה
            </Button>
          </div>
        </div>
      </div>

      <div className={cn('space-y-4', compact ? 'p-5' : 'p-4')}>
        {error ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <AlertCircle className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold text-gray-700">לא ניתן לטעון בקשות חתימה</p>
            <p className="text-xs text-gray-400">{error}</p>
          </div>
        ) : compact ? (
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
            {tableItems.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm font-semibold text-gray-500">אין בקשות חתימה פעילות</div>
            ) : (
              tableItems.map((req) => (
                <button
                  key={req.id}
                  type="button"
                  onClick={() => setAuditRequestId(req.id)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-right transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-gray-900">{req.title}</p>
                    <p className="mt-0.5 truncate text-[11px] text-gray-500">
                      {req.business_name ?? (req.office_client_number != null ? formatClientOfficeId(req.office_client_number) : `לקוח #${req.client_record_id}`)} · {formatDate(req.created_at)}
                    </p>
                  </div>
                  <StatusBadge
                    status={req.status}
                    getLabel={getSignatureRequestStatusLabel}
                    variantMap={signatureRequestStatusVariants}
                  />
                </button>
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
              title: 'אין בקשות חתימה',
              message: 'אין בקשות חתימה פעילות',
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
    </section>
  )
}

SignatureRequestsDashboardPanel.displayName = 'SignatureRequestsDashboardPanel'
