import { useState } from 'react'
import { FileSignature, Plus } from 'lucide-react'
import { Card } from '../../../components/ui/primitives/Card'
import { Button } from '../../../components/ui/primitives/Button'
import { StateCard } from '../../../components/ui/feedback/StateCard'
import { Alert } from '../../../components/ui/overlays/Alert'
import { SkeletonBlock } from '../../../components/ui/primitives/SkeletonBlock'
import { SignatureRequestRow } from './SignatureRequestRow'
import { SignatureRequestAuditDrawer } from './SignatureRequestAuditDrawer'
import { CreateSignatureRequestModal } from './CreateSignatureRequestModal'
import { useClientSignatureRequests } from '../hooks/useClientSignatureRequests'
import { useSignatureRequestActions } from '../hooks/useSignatureRequestActions'
import { useSignatureRequestSigningUrls } from '../utils'
import type { ClientRecordResponse } from '@/features/clients'

interface Props {
  client: ClientRecordResponse
  businessId: number | null | undefined
  canManage: boolean
}

export const SignatureRequestsCard: React.FC<Props> = ({ client, businessId, canManage }) => {
  const [showCreate, setShowCreate] = useState(false)
  const [auditRequestId, setAuditRequestId] = useState<number | null>(null)

  const { items, total, isLoading, error } = useClientSignatureRequests({ clientId: client.id })
  const { createAndSend, isCreatingAndSending, send, isSending, cancel, isCanceling } = useSignatureRequestActions(
    client.id,
  )
  const { signingUrls, handleSend, rememberSigningUrl } = useSignatureRequestSigningUrls(send)

  return (
    <>
      <Card
        title={`בקשות חתימה${total > 0 ? ` (${total})` : ''}`}
        actions={
          canManage ? (
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-3.5 w-3.5" />
              בקשה חדשה
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
              message="אין בקשות חתימה עבור לקוח זה"
              action={canManage ? { label: 'יצירת בקשה ראשונה', onClick: () => setShowCreate(true) } : undefined}
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
                  isSending={isSending}
                  isCanceling={isCanceling}
                  canManage={canManage}
                  onSend={handleSend}
                  onCancel={cancel}
                  onAudit={setAuditRequestId}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      <SignatureRequestAuditDrawer requestId={auditRequestId} onClose={() => setAuditRequestId(null)} />

      <CreateSignatureRequestModal
        open={showCreate}
        clientId={client.id}
        businessId={businessId ?? undefined}
        signerName={client.full_name}
        signerEmail={client.email ?? undefined}
        signerPhone={client.phone ?? undefined}
        isLoading={isCreatingAndSending}
        onClose={() => setShowCreate(false)}
        onCreateAndSend={async (payload) => {
          const result = await createAndSend(payload)
          rememberSigningUrl(result)
        }}
      />
    </>
  )
}
SignatureRequestsCard.displayName = 'SignatureRequestsCard'
