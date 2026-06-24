import { useState } from 'react'
import { FileSignature, Plus } from 'lucide-react'
import { Card } from '../../../../components/ui/primitives/Card'
import { Button } from '../../../../components/ui/primitives/Button'
import { StateCard } from '../../../../components/ui/feedback/StateCard'
import { Alert } from '../../../../components/ui/overlays/Alert'
import { SkeletonBlock } from '../../../../components/ui/primitives/SkeletonBlock'
import { PaginationCard } from '../../../../components/ui/table/PaginationCard'
import { getTotalPages } from '../../../../utils/paginationUtils'
import { SignatureRequestRow } from '../list/SignatureRequestRow'
import { SignatureRequestAuditDrawer } from '../detail/SignatureRequestAuditDrawer'
import { CreateSignatureRequestModal } from '../form/CreateSignatureRequestModal'
import { SendNotificationModal, type NotificationTrigger } from '@/features/notifications'
import { useClientSignatureRequests } from '../../hooks/useClientSignatureRequests'
import { useSignatureRequestActions } from '../../hooks/useSignatureRequestActions'
import { useSignatureRequestSigningUrls } from '../../utils'
import type { ClientRecordResponse } from '@/features/clients'
import { PAGE_SIZE_XS as PAGE_SIZE } from '@/constants/pagination.constants'
import { SIGNATURE_REQUESTS_MESSAGES } from '../../messages'

interface Props {
  client: ClientRecordResponse
  businessId: number | null | undefined
  canManage: boolean
}

export const SignatureRequestsCard: React.FC<Props> = ({ client, businessId, canManage }) => {
  const [showCreate, setShowCreate] = useState(false)
  const [auditRequestId, setAuditRequestId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [notificationContext, setNotificationContext] = useState<{
    requestId: number
    trigger: NotificationTrigger
  } | null>(null)

  const { items, total, isLoading, error } = useClientSignatureRequests({
    clientId: client.id,
    page,
    pageSize: PAGE_SIZE,
  })
  const { create, isCreating, cancel, isCanceling } = useSignatureRequestActions(client.id)
  const { signingUrls, rememberSigningUrl } = useSignatureRequestSigningUrls()

  const totalPages = getTotalPages(total, PAGE_SIZE)

  return (
    <>
      <Card
        title={SIGNATURE_REQUESTS_MESSAGES.card.title(total)}
        actions={
          canManage ? (
            <Button
              variant="ghost"
              size="sm"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setShowCreate(true)}
            >
              {SIGNATURE_REQUESTS_MESSAGES.actions.newRequest}
            </Button>
          ) : undefined
        }
      >
        <div className="space-y-2">
          {error && <Alert variant="error" message={error} />}

          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <SkeletonBlock key={i} height="h-16" rounded="xl" width="w-full" />
              ))}
            </div>
          )}

          {!isLoading && !error && items.length === 0 && (
            <StateCard
              icon={FileSignature}
              message={SIGNATURE_REQUESTS_MESSAGES.card.noRequestsForClient}
              action={
                canManage
                  ? {
                      label: SIGNATURE_REQUESTS_MESSAGES.actions.createFirstRequest,
                      onClick: () => setShowCreate(true),
                    }
                  : undefined
              }
              size="compact"
            />
          )}

          {!isLoading && items.length > 0 && (
            <div className="space-y-2">
              {items.map((req) => (
                <SignatureRequestRow
                  key={req.id}
                  request={req}
                  signingUrl={signingUrls[req.id]}
                  isCanceling={isCanceling}
                  canManage={canManage}
                  onCancel={(id) => cancel(client.id, id)}
                  onAudit={setAuditRequestId}
                  onSendNotification={(requestId, trigger) => setNotificationContext({ requestId, trigger })}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      {totalPages > 1 && (
        <PaginationCard
          page={page}
          totalPages={totalPages}
          total={total}
          label={SIGNATURE_REQUESTS_MESSAGES.card.paginationLabel}
          onPageChange={setPage}
        />
      )}

      <SignatureRequestAuditDrawer requestId={auditRequestId} onClose={() => setAuditRequestId(null)} />

      {notificationContext && (
        <SendNotificationModal
          open={notificationContext !== null}
          onClose={() => setNotificationContext(null)}
          clientRecordId={client.id}
          initialTrigger={notificationContext.trigger}
          entityId={notificationContext.requestId}
          disableTriggerChange
        />
      )}

      <CreateSignatureRequestModal
        open={showCreate}
        clientId={client.id}
        businessId={businessId ?? undefined}
        signerName={client.full_name}
        signerEmail={client.email ?? undefined}
        signerPhone={client.phone ?? undefined}
        isLoading={isCreating}
        onClose={() => setShowCreate(false)}
        onCreate={async (payload) => {
          const result = await create(payload)
          rememberSigningUrl(result)
        }}
      />
    </>
  )
}
SignatureRequestsCard.displayName = 'SignatureRequestsCard'
